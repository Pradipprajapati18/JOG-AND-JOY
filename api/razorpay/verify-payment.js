import crypto from 'crypto';

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

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    console.error('RAZORPAY_KEY_SECRET missing in server environment variables');
    return sendJson(res, 500, {
      success: false,
      message: 'Razorpay secret key not configured on server.'
    });
  }

  try {
    const body = await parseBody(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendJson(res, 400, {
        success: false,
        message: 'Missing required Razorpay payment credentials for verification.'
      });
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    // Secure timing-safe comparison to prevent timing attacks
    const bufA = Buffer.from(generated_signature, 'utf-8');
    const bufB = Buffer.from(razorpay_signature, 'utf-8');
    const isAuthentic = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

    if (isAuthentic) {
      return sendJson(res, 200, {
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      return sendJson(res, 400, {
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
}
