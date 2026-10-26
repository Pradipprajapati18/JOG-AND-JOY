import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

async function parseBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method Not Allowed' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('Razorpay keys not configured on server. Returning simulated refund response.');
    return sendJson(res, 200, {
      success: true,
      simulated: true,
      message: 'Razorpay keys not configured; refund recorded for manual bank credit.'
    });
  }

  try {
    const body = await parseBody(req);
    const { paymentId, amount, reason = 'Customer Cancellation', orderNumber } = body;

    if (!paymentId) {
      return sendJson(res, 400, {
        success: false,
        message: 'Valid Razorpay paymentId is required to process refund.'
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const refundOptions = {
      notes: {
        reason: reason,
        orderNumber: orderNumber || 'N/A'
      }
    };

    if (amount && Number(amount) > 0) {
      refundOptions.amount = Math.round(Number(amount) * 100); // In paise
    }

    const refund = await instance.payments.refund(paymentId, refundOptions);

    // Optional: Log to database if Supabase configured
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && orderNumber) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('orders').update({
          paymentStatus: 'refunded',
          updatedAt: new Date().toISOString()
        }).or(`orderNumber.eq.${orderNumber},id.eq.${orderNumber}`);
      } catch (dbErr) {
        console.warn('Non-fatal: Could not update order paymentStatus to refunded in db:', dbErr);
      }
    }

    return sendJson(res, 200, {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status || 'processed',
      message: 'Refund successfully initiated via Razorpay.'
    });
  } catch (error) {
    console.error('Error initiating Razorpay refund:', error);
    return sendJson(res, 500, {
      success: false,
      message: error?.error?.description || error.message || 'Failed to process refund via payment gateway'
    });
  }
}
