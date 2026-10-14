import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Ensure browser immediately loads and refreshes tab favicon
if (typeof document !== 'undefined') {
  const setFavicon = () => {
    const existing = document.querySelectorAll("link[rel*='icon']");
    existing.forEach(el => el.remove());
    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = '/images/jog-and-joy-favicon.png?v=' + Date.now();
    document.head.appendChild(link);
  };
  setFavicon();
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
