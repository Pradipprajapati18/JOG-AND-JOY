import path from "path"
import { fileURLToPath } from "url"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function razorpayDevApiPlugin() {
  return {
    name: 'razorpay-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url === '/api/razorpay/create-order' || url.startsWith('/api/razorpay/create-order?')) {
          try {
            const { default: handler } = await import('./api/razorpay/create-order.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Error in dev create-order:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: err.message }));
            return;
          }
        }
        if (url === '/api/razorpay/verify-payment' || url.startsWith('/api/razorpay/verify-payment?')) {
          try {
            const { default: handler } = await import('./api/razorpay/verify-payment.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Error in dev verify-payment:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: err.message }));
            return;
          }
        }
        if (url === '/api/razorpay/webhook' || url.startsWith('/api/razorpay/webhook?')) {
          try {
            const { default: handler } = await import('./api/razorpay/webhook.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Error in dev razorpay webhook:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: err.message }));
            return;
          }
        }
        if (url === '/api/shipping/webhook' || url.startsWith('/api/shipping/webhook?')) {
          try {
            const { default: handler } = await import('./api/shipping/webhook.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Error in dev shipping webhook:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env so serverless functions in local dev can read the keys
  process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  process.env.VITE_RAZORPAY_KEY_ID = env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

  return {
    plugins: [react(), tailwindcss(), razorpayDevApiPlugin()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      watch: {
        ignored: ['**/refrence/**']
      }
    }
  };
});
