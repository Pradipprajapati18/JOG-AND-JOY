import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

async function getRawBody(req) {
  if (req.rawBody) return req.rawBody;
  if (req.body && typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);

  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Razorpay-Signature, Content-Type'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  try {
    const rawBody = await getRawBody(req);

    // 1. Verify webhook signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        return sendJson(res, 400, { success: false, message: 'Missing x-razorpay-signature header' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const bufA = Buffer.from(expectedSignature, 'utf-8');
      const bufB = Buffer.from(signature, 'utf-8');
      const isSignatureValid = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

      if (!isSignatureValid) {
        console.error('Razorpay Webhook signature verification failed');
        return sendJson(res, 400, { success: false, message: 'Invalid webhook signature' });
      }
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const paymentId = paymentEntity?.id;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (!paymentId && !razorpayOrderId) {
      return sendJson(res, 200, { received: true, note: 'No payment or order entity in payload' });
    }

    // 2. Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured in server environment; webhook acknowledged.');
      return sendJson(res, 200, { received: true, warning: 'Database credentials not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Process payment events
    if (event === 'payment.captured' || event === 'order.paid') {
      // Find matching order in Supabase
      let query = supabase.from('orders').select('*');
      if (razorpayOrderId) {
        query = query.or(`razorpayOrderId.eq.${razorpayOrderId},razorpayPaymentId.eq.${paymentId}`);
      } else {
        query = query.eq('razorpayPaymentId', paymentId);
      }

      const { data: matchedOrders, error: findError } = await query;

      if (findError) {
        console.error('Error querying orders in webhook:', findError);
      } else if (matchedOrders && matchedOrders.length > 0) {
        const order = matchedOrders[0];
        
        // Idempotently update payment status to paid if not already paid
        if (order.paymentStatus !== 'paid') {
          const updatedHistory = Array.isArray(order.statusHistory)
            ? [...order.statusHistory, {
                status: order.status || 'PROCESSING',
                timestamp: new Date().toISOString(),
                note: `Payment verified & captured asynchronously via Razorpay Webhook (${paymentId})`
              }]
            : [{
                status: order.status || 'PROCESSING',
                timestamp: new Date().toISOString(),
                note: `Payment verified & captured asynchronously via Razorpay Webhook (${paymentId})`
              }];

          await supabase
            .from('orders')
            .update({
              paymentStatus: 'paid',
              razorpayPaymentId: paymentId || order.razorpayPaymentId,
              statusHistory: updatedHistory,
              updatedAt: new Date().toISOString()
            })
            .eq('id', order.id);

          console.log(`Order ${order.id} marked as paid via Razorpay webhook.`);
        }
      } else {
        // Customer paid, but closed browser or connection dropped before onSuccess finished inserting order
        console.warn(`Webhook received captured payment ${paymentId} (Order: ${razorpayOrderId}) with no matching local order. Rescuing order transaction...`);
        try {
          const notes = paymentEntity?.notes || orderEntity?.notes || {};
          const receipt = orderEntity?.receipt || notes.orderNumber || notes.receipt || `JJ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90) + 10}`;
          const amountInRupees = paymentEntity?.amount ? (Number(paymentEntity.amount) / 100) : 0;
          const customerEmail = notes.customerEmail || paymentEntity?.email || '';
          const customerName = notes.customerName || 'Customer';
          const customerPhone = notes.customerPhone || paymentEntity?.contact || '';

          const rescuedOrder = {
            id: receipt,
            orderNumber: receipt,
            createdAt: new Date().toISOString(),
            status: 'PROCESSING',
            paymentStatus: 'paid',
            paymentMethod: 'online',
            fulfillmentStatus: 'unfulfilled',
            channel: 'Web Storefront (Webhook Rescued)',
            subtotal: amountInRupees,
            discountAmount: 0,
            shippingCost: 0,
            total: amountInRupees,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: paymentId,
            items: [],
            shippingAddress: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              line1: 'Pending Customer Address Confirmation',
              city: 'India',
              country: 'India'
            },
            statusHistory: [
              {
                status: 'PROCESSING',
                timestamp: new Date().toISOString(),
                note: `Order automatically rescued via Razorpay Webhook (Payment ID: ${paymentId}). Customer disconnected before browser callback.`
              }
            ]
          };

          const { error: insertError } = await supabase.from('orders').insert([rescuedOrder]);
          if (insertError) {
            console.error('Failed to insert rescued order in webhook:', insertError);
          } else {
            console.log(`Successfully rescued paid order ${receipt} via webhook.`);
          }
        } catch (rescueErr) {
          console.error('Error rescuing order in webhook:', rescueErr);
        }
      }
    }

    return sendJson(res, 200, { success: true, received: true, event });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return sendJson(res, 500, { success: false, message: error.message });
  }
}
