import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const originalFetch = window.fetch;
Object.defineProperty(window, 'fetch', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: async (...args: Parameters<typeof originalFetch>) => {
    let url = args[0];
    let options = args[1] || {};

    if (typeof url === 'string' && url.startsWith('/api/')) {
      if (Capacitor.isNativePlatform()) {
        // Since you are testing on Android directly without a PC, the app needs to connect to the live backend.
         const apiBase = (import.meta as any).env.VITE_API_BASE || 'https://ais-pre-2gbdiemrqbqhx6efzwgpgf-978163732318.asia-southeast1.run.app';
         url = apiBase + url;
      }

      // Inject publishable key to make app securely self-dependent
      const pubKey = (import.meta as any).env.VITE_APP_PUBLISHABLE_KEY;
      if (pubKey) {
        options.headers = {
          ...options.headers,
          'x-publishable-key': pubKey
        };
      }
      
      args[0] = url;
      args[1] = options;
    }
    return originalFetch(...args);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
