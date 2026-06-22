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
      const isCapacitorNative = !!(window as any).Capacitor?.isNative;
      
      if (isCapacitorNative) {
         const apiBase = (import.meta as any).env.VITE_API_BASE || 'https://ais-pre-2gbdiemrqbqhx6efzwgpgf-978163732318.asia-southeast1.run.app';
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
