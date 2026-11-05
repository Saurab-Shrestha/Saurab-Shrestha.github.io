import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { appConfig } from './config/app.config';

// Served from the root of saurab-shrestha.github.io (a GitHub user page), so
// base is simply '/' and dev, preview and production all agree. This was a
// project page at /SaurabShrestha/ until the repo was renamed, which needed a
// per-command base and was the source of a production outage.
// GitHub Pages has no SPA rewrite. Every known route gets its own copy of
// index.html (dist/work/pramana/index.html, ...) so it is served with HTTP 200,
// which crawlers and link previews need. 404.html is the same shell for
// anything else, so the SPA still boots and renders its NotFound page.
// Each shell also gets its own title, description and canonical URL, so search
// results and link previews show the page rather than the home page.
const SITE = 'https://saurab-shrestha.github.io';
const NAME = 'Saurab Shrestha';

const frontmatterField = (raw: string, key: string) =>
  raw.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1] ?? '';

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const withMeta = (html: string, route: string, title: string, description: string) => {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const url = `${SITE}/${route}`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${d}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${t}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${d}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${t}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${d}`);
};

const spaFallback = () => ({
  name: 'spa-route-shells',
  closeBundle() {
    const dist = path.resolve(__dirname, appConfig.build.outDir);
    const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    const data = path.resolve(__dirname, 'src/data');

    const pages: Array<[route: string, title: string, description: string]> = [
      ['work', `Work — ${NAME}`, 'Document AI for banks, and Pramana, the agentic RAG system that grew out of it.'],
      ['blog', `Writing — ${NAME}`, 'Long-form notes on models, retrieval and evaluation.'],
    ];
    for (const f of fs.readdirSync(path.join(data, 'projects')).filter(f => f.endsWith('.md'))) {
      const raw = fs.readFileSync(path.join(data, 'projects', f), 'utf8');
      pages.push([`work/${f.replace(/\.md$/, '')}`, `${frontmatterField(raw, 'name')} — ${NAME}`, frontmatterField(raw, 'desc')]);
    }
    for (const d of fs.readdirSync(path.join(data, 'blog'), { withFileTypes: true }).filter(d => d.isDirectory())) {
      const md = fs.readdirSync(path.join(data, 'blog', d.name)).find(f => f.endsWith('.md'));
      if (!md) continue;
      const raw = fs.readFileSync(path.join(data, 'blog', d.name, md), 'utf8');
      pages.push([`blog/${d.name}`, `${frontmatterField(raw, 'title')} — ${NAME}`, frontmatterField(raw, 'excerpt')]);
    }

    // GitHub Pages serves /work/pramana from work/pramana.html with a 200 and
    // no redirect; the folder copy covers /work/pramana/ as well.
    for (const [route, title, description] of pages) {
      const html = withMeta(shell, route, title, description);
      fs.mkdirSync(path.join(dist, route), { recursive: true });
      fs.writeFileSync(path.join(dist, `${route}.html`), html);
      fs.writeFileSync(path.join(dist, route, 'index.html'), html);
    }
    fs.writeFileSync(path.join(dist, '404.html'), shell);
  },
});

export default defineConfig({
  base: '/',
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