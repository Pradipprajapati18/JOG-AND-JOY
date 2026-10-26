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
    const { amount, currency = 'INR', receipt, notes, items } = body;

    let finalAmount = Number(amount);

    // Security Check: If line items are provided, verify with database to prevent client price tampering
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && Array.isArray(items) && items.length > 0) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const productIds = Array.from(new Set(items.map(i => i.productId || i.id).filter(Boolean)));
        
        const { data: dbProducts } = await supabase
          .from('products')
          .select('id, basePrice, price, variants')
          .in('id', productIds);

        if (dbProducts && dbProducts.length > 0) {
          let calculatedSubtotal = 0;
          for (const item of items) {
            const prod = dbProducts.find(p => String(p.id) === String(item.productId || item.id));
            if (prod) {
              let itemPrice = Number(prod.basePrice ?? prod.price ?? 0);
              const reqSize = item.size ? (typeof item.size === 'object' ? item.size.name : String(item.size)) : null;
              const reqColor = item.color ? String(item.color).toLowerCase() : null;

              if (Array.isArray(prod.variants) && (reqSize || reqColor)) {
                const matchedV = prod.variants.find(v => {
                  const sMatch = !reqSize || String(v.size || '').toLowerCase() === reqSize.toLowerCase();
                  const cMatch = !reqColor || String(v.colorHex || '').toLowerCase() === reqColor;
                  return sMatch && cMatch;
                });
                if (matchedV && matchedV.price) {
                  itemPrice = Number(matchedV.price);
                }
              }
              calculatedSubtotal += (itemPrice * (Number(item.quantity) || 1));
            }
          }

          // If client sent an amount less than 10% of subtotal (e.g. ₹1 tampering attempt)
          if (calculatedSubtotal > 0 && finalAmount < (calculatedSubtotal * 0.1)) {
            console.warn(`[Security Alert] Potential price tampering detected. Calculated subtotal: ₹${calculatedSubtotal}, Client amount: ₹${finalAmount}`);
            return sendJson(res, 400, {
              success: false,
              message: 'Invalid order amount. Price tampering detected.'
            });
          }
        }
      } catch (dbVerifyErr) {
        console.warn('Non-fatal: Database price cross-verification note:', dbVerifyErr.message);
      }
    }

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      return sendJson(res, 400, {
        success: false,
        message: 'Valid order amount is required.'
      });
    }

    // Convert amount in Rupees to integer Paise (e.g. ₹499 -> 49900)
    const amountInPaise = Math.round(finalAmount * 100);

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
