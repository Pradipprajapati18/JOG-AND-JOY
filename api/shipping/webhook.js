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
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

  // Security Verification: If webhook secret is set in environment, enforce authentication
  const webhookSecret = process.env.SHIPPING_WEBHOOK_SECRET;
  if (webhookSecret) {
    const providedSecret = req.headers['x-webhook-token'] || req.headers['x-api-key'] || req.headers['x-shiprocket-signature'] || (req.query && req.query.secret);
    if (!providedSecret || providedSecret !== webhookSecret) {
      return sendJson(res, 401, {
        success: false,
        message: 'Unauthorized: Invalid or missing shipping webhook token.'
      });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return sendJson(res, 500, {
      success: false,
      message: 'Supabase credentials missing on server.'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload = await parseBody(req);

    // Support multiple aggregator payload formats (Shiprocket, Delhivery, custom)
    const rawOrderId = payload.order_id || payload.orderNumber || payload.order_number || payload.channel_order_id;
    const awb = payload.awb || payload.awb_code || payload.tracking_id || payload.tracking_number;
    const courierName = payload.courier_name || payload.carrier || 'Express Logistics';
    const trackingUrl = payload.tracking_url || (awb ? `https://shiprocket.co/tracking/${awb}` : null);
    const rawStatus = (payload.current_status || payload.status || '').toUpperCase();

    if (!rawOrderId && !awb) {
      return sendJson(res, 400, {
        success: false,
        message: 'Order ID or AWB is required in webhook payload.'
      });
    }

    // Map carrier status to Jog & Joy standard status
    let mappedStatus = null;
    if (['DELIVERED', 'COMPLETED'].includes(rawStatus)) {
      mappedStatus = 'DELIVERED';
    } else if (['IN_TRANSIT', 'SHIPPED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(rawStatus)) {
      mappedStatus = 'SHIPPED';
    }

    // Locate order in database by orderNumber or id
    let query = supabase.from('orders').select('*');
    if (rawOrderId) {
      query = query.or(`orderNumber.eq.${rawOrderId},id.eq.${rawOrderId}`);
    } else {
      query = query.or(`trackingId.eq.${awb}`);
    }

    const { data: existingOrders, error: findError } = await query;
    if (findError || !existingOrders || existingOrders.length === 0) {
      return sendJson(res, 404, {
        success: false,
        message: `Order not found for ID: ${rawOrderId || awb}`
      });
    }

    const order = existingOrders[0];
    const newStatus = mappedStatus || order.status;

    const historyEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: `Courier update from ${courierName}: ${rawStatus || 'In Progress'}`
    };

    const updatePayload = {
      ...(mappedStatus ? { status: mappedStatus } : {}),
      ...(awb ? { trackingId: awb } : {}),
      ...(courierName ? { carrier: courierName } : {}),
      ...(trackingUrl ? { trackingUrl } : {}),
      statusHistory: [...(order.statusHistory || []), historyEntry],
      shippingAddress: {
        ...(order.shippingAddress || {}),
        ...(awb ? { trackingNumber: awb, trackingId: awb } : {}),
        ...(courierName ? { carrier: courierName } : {}),
        ...(trackingUrl ? { trackingUrl } : {})
      }
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order via logistics webhook:', updateError);
      return sendJson(res, 500, { success: false, message: updateError.message });
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Order tracking updated successfully',
      orderId: order.id,
      status: newStatus
    });
  } catch (error) {
    console.error('Logistics webhook handler error:', error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || 'Internal webhook error'
    });
  }
}
