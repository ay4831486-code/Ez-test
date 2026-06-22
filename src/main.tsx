import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const originalFetch = window.fetch;
Object.defineProperty(window, 'fetch', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: async (...args: Parameters<typeof originalFetch>) => {
    if (typeof args[0] === 'string' && args[0].startsWith('/api/')) {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isCapacitor = isLocalhost && window.location.protocol.includes('http');
      
      // Check if we have an explicit VITE_API_BASE
      const apiBase = (import.meta as any).env.VITE_API_BASE;
      // We want to rewrite if we are in Capacitor
      if (isCapacitor && apiBase) {
         args[0] = apiBase + args[0];
      }
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
