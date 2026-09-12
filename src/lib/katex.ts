/**
 * Lazy KaTeX loader.
 *
 * KaTeX used to load from index.html on every route — ~300 KB of CSS + JS on the
 * homepage, which has no math. It now loads only when a rendered document
 * actually contains math delimiters.
 */

const VERSION = '0.16.11';
const CDN = `https://cdn.jsdelivr.net/npm/katex@${VERSION}/dist`;

let loader: Promise<void> | null = null;

/** True if the markdown contains $...$ or $$...$$ worth loading KaTeX for. */
export const hasMath = (content: string): boolean =>
  /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/.test(content);

export function loadKatex(): Promise<void> {
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${CDN}/katex.min.css`;
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = `${CDN}/katex.min.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('KaTeX failed to load'));
    document.head.appendChild(script);
  }).catch(err => {
    // Let a later render retry rather than caching the failure forever.
    loader = null;
    throw err;
  });

  return loader;
}
