/// <reference types="vite/client" />

declare module "*.md?raw" {
  const content: string;
  export default content;
}

/** KaTeX is injected at runtime by src/lib/katex.ts, not bundled. */
interface KatexRenderOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
}

interface Window {
  katex?: {
    renderToString(tex: string, options?: KatexRenderOptions): string;
  };
}
