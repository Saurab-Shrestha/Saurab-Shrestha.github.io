import { useEffect, useSyncExternalStore } from 'react';
import { subscribeRouteReady, getRouteVersion } from '../lib/routeReady';

const REVEAL_SELECTOR = '.reveal, .reveal-left';
/** Cap the cascade so a long batch doesn't read as a slow wave. */
const MAX_STAGGER_STEPS = 6;

/**
 * Reveals `.reveal` / `.reveal-left` elements once, then stops watching them.
 *
 * Previously two observers ran over the same elements — one here and one in
 * Home.tsx — with competing 80ms and 90ms staggers, plus a MutationObserver on
 * document.body{subtree:true} that re-ran querySelectorAll on every React
 * insert. Routes now announce themselves via useRouteContentReady instead.
 *
 * The stagger is applied as a CSS custom property rather than a setTimeout, so
 * it survives the element being scrolled past mid-cascade.
 */
export function useScrollReveal(pathname: string) {
  // Bumps when a lazily-loaded route commits its DOM, so the query below
  // doesn't run against a Suspense fallback and find nothing.
  const routeVersion = useSyncExternalStore(subscribeRouteReady, getRouteVersion, getRouteVersion);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
    if (els.length === 0) return;

    // Everything already on screen at mount reveals together — a cascade the
    // user never saw begin just looks like lag.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
      let step = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        if (!reduce) {
          el.style.setProperty('--reveal-delay', `calc(var(--stagger) * ${Math.min(step, MAX_STAGGER_STEPS)})`);
          step += 1;
        }
        el.classList.add('visible');
        observer.unobserve(el); // entrance only; never replay
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname, routeVersion]);
}
