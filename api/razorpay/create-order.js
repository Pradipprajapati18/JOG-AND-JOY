import Razorpay from 'razorpay';

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

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Razorpay keys missing in server environment variables');
    return sendJson(res, 500, {
      success: false,
      message: 'Razorpay API keys not configured. Please check your environment variables.'
    });
  }

  try {
    const body = await parseBody(req);
    const { amount, currency = 'INR', receipt, notes } = body;

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return sendJson(res, 400, {
        success: false,
        message: 'Valid order amount is required.'
      });
    }

    // Convert amount in Rupees to integer Paise (e.g. ₹499 -> 49900)
    const amountInPaise = Math.round(numAmount * 100);

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await instance.orders.create(options);

    return sendJson(res, 200, {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      keyId: keyId
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return sendJson(res, 500, {
      success: false,
      message: error?.error?.description || error.message || 'Failed to create Razorpay order'
    });
  }
}
