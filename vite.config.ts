import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          navigateFallback: '/index.html'
        },
        manifest: {
          id: '/?source=pwa',
          name: 'EZ TEST',
          short_name: 'EZ TEST',
          description: 'Coaching Institute Testing Platform',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          dir: 'ltr',
          categories: ['education', 'productivity'],
          orientation: 'portrait',
          screenshots: [
            {
              src: '/screenshot-desktop.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide'
            },
            {
              src: '/screenshot-mobile.png',
              sizes: '720x1280',
              type: 'image/png',
              form_factor: 'narrow'
            }
          ],
          prefer_related_applications: false,
          shortcuts: [
            {
              name: 'Start Live Test',
              short_name: 'Live Test',
              description: 'Join a scheduled live test',
              url: '/?tab=live',
              icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }]
            },
            {
              name: 'Practice Mode',
              short_name: 'Practice',
              description: 'Take a mock practice paper',
              url: '/?tab=practice',
              icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }]
            }
          ],
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            motion: ['motion/react']
          }
        }
      }
    }
  };
});
