/**
 * Resolve a path in `public/` against the deploy base path.
 *
 * The site sits at the root today, so this returns the path unchanged. It stays
 * because `base` is a deploy-time decision: it was /SaurabShrestha/ before the
 * repo was renamed to a user page, and would be again under any sub-path.
 * Routing raw <img src> and <a href> through here means a future base change
 * needs no edits at the call sites. `<Link>` is covered by the router basename.
 */
export const asset = (p: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, '');
