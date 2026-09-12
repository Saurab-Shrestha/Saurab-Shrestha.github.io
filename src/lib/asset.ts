/**
 * Resolve a path in `public/` against the deploy base path.
 *
 * The site is served from /SaurabShrestha/ on GitHub Pages, so a literal
 * "/assets/foo.png" in JSX 404s in production. `<Link>` is handled by the
 * router's basename; raw <img src> and <a href> need this.
 */
export const asset = (p: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, '');
