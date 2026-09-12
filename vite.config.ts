import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { appConfig } from './config/app.config';

// GitHub Pages serves this repo as a project page at /SaurabShrestha/, so the
// built asset URLs must carry that prefix or they all 404 in production.
//
// The dev server has no such constraint, and inheriting the prefix there just
// means localhost:3000/ 404s and every hand-typed path needs it. So: root in
// dev, prefixed everywhere the built output is involved.
//
// `vite preview` runs with command === 'serve' but serves the *built* files, so
// it needs the production base too — otherwise it hosts at / while index.html
// asks for /SaurabShrestha/assets/*, and nothing boots.
// import.meta.env.BASE_URL follows automatically; asset() and the router
// basename both read it.
const PROD_BASE = '/SaurabShrestha/';

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

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? PROD_BASE : '/',
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
}));