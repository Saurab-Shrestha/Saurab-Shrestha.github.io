import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { appConfig } from './config/app.config';

// GitHub Pages serves this repo as a project page at /SaurabShrestha/.
// `base` must match or every emitted asset URL 404s in production.
const BASE = '/SaurabShrestha/';

// GitHub Pages has no SPA rewrite: a hard refresh on /work returns GitHub's own
// 404 page. Serving a copy of index.html as 404.html lets the SPA boot and route
// itself, with no redirect hop or query-string flash.
const spaFallback = () => ({
  name: 'spa-404-fallback',
  closeBundle() {
    const dist = path.resolve(__dirname, appConfig.build.outDir);
    fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
  },
});

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: appConfig.dev.port,
    host: appConfig.dev.host,
    open: appConfig.dev.open,
    cors: true,
    hmr: {
      overlay: true,
    },
  },
  preview: {
    port: appConfig.dev.previewPort,
    host: appConfig.dev.host,
    open: appConfig.dev.open,
  },
  build: {
    outDir: appConfig.build.outDir,
    sourcemap: appConfig.build.sourcemap,
    minify: appConfig.build.minify,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  css: {
    devSourcemap: true,
  },
});