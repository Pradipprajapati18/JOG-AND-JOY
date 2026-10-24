/**
 * Razorpay Checkout & API Helper Utilities
 */

/**
 * Dynamically loads the Razorpay checkout script if not already loaded.
 * @returns {Promise<boolean>}
 */
export const loadRazorpaySdk = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Calls backend to create a Razorpay order
 * @param {Object} params
 * @param {number} params.amount - Total order amount in INR (Rupees)
 * @param {string} [params.receipt] - Receipt / internal order identifier
 * @param {Object} [params.notes] - Key-value metadata
 * @returns {Promise<{success: boolean, order: Object, keyId: string}>}
 */
export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, receipt, notes })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to initialize payment order');
  }

  return data;
};

/**
 * Calls backend to cryptographically verify Razorpay payment signature
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {Promise<{success: boolean, message: string, paymentId: string, orderId: string}>}
 */
export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}) => {
  const response = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Payment signature verification failed');
  }

  return data;
};

/**
 * Launches the Razorpay checkout modal
 * @param {Object} config
 */
export const launchRazorpayCheckout = async ({
  razorpayOrder,
  keyId,
  customer,
  orderNumber,
  onSuccess,
  onFailure,
  onDismiss
}) => {
  const isLoaded = await loadRazorpaySdk();
  if (!isLoaded) {
    throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
  }

  const options = {
    key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency || 'INR',
    name: 'Jog & Joy',
    description: `Order ${orderNumber}`,
    image: '/images/official_logo.webp',
    order_id: razorpayOrder.id,
    handler: async (response) => {
      try {
        const verification = await verifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
        if (onSuccess) {
          await onSuccess({
            ...verification,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        }
      } catch (err) {
        if (onFailure) {
          onFailure(err);
        } else {
          alert(`Payment verification failed: ${err.message}`);
        }
      }
    },
    prefill: {
      name: customer?.name || '',
      email: customer?.email || '',
      contact: customer?.phone || ''
    },
    theme: {
      color: '#EF4A45'
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    const errorMsg = response.error?.description || 'Payment was declined';
    if (onFailure) {
      onFailure(new Error(errorMsg));
    } else {
      alert(`Payment Failed: ${errorMsg}`);
    }
  });

  rzp.open();
};
