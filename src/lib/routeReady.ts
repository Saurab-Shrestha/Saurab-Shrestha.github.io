import { useEffect } from 'react';

/**
 * Signals that a lazily-loaded route has committed its DOM.
 *
 * Routes render inside <Suspense>, so on first commit MainLayout and NavBar see
 * only the fallback — any querySelector they run finds nothing, and they never
 * re-render when the real content arrives. The previous code solved this with a
 * MutationObserver on document.body{subtree:true}, which re-ran querySelectorAll
 * on every React insert anywhere in the app.
 *
 * Instead the page says when it's ready, and interested components subscribe.
 */

let version = 0;
const listeners = new Set<() => void>();

export const subscribeRouteReady = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

export const getRouteVersion = (): number => version;

/** Call from a page component once its content is mounted. */
export function useRouteContentReady(): void {
  useEffect(() => {
    version += 1;
    listeners.forEach(fn => fn());
  }, []);
}
