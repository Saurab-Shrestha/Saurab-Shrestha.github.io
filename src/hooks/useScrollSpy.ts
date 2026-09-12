import { useEffect, useState, useSyncExternalStore } from 'react';
import { subscribeRouteReady, getRouteVersion } from '../lib/routeReady';

/**
 * Returns the id of the section currently occupying the reading position.
 *
 * Uses one IntersectionObserver rather than a scroll listener: the browser does
 * the intersection maths off the main thread, and there's no per-frame layout
 * read. The rootMargin pins the trigger line near the top of the viewport, just
 * below the fixed nav, so a section becomes "current" when you reach its
 * heading rather than when its last pixel leaves.
 */
export function useScrollSpy(ids: string[], enabled = true): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const routeVersion = useSyncExternalStore(subscribeRouteReady, getRouteVersion, getRouteVersion);

  useEffect(() => {
    if (!enabled || ids.length === 0) {
      setActiveId(null);
      return;
    }

    const sections = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // Track ratios so the topmost *visible* section wins, rather than whichever
    // one happened to fire its callback last.
    const visible = new Map<string, number>();

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
        else visible.delete(entry.target.id);
      }

      if (visible.size === 0) return;
      // Document order, not insertion order — the first visible section is current.
      const current = ids.find(id => visible.has(id));
      if (current) setActiveId(current);
    }, {
      rootMargin: '-80px 0px -55% 0px',
      threshold: [0, 0.25, 0.5],
    });

    sections.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, enabled, routeVersion]);

  return activeId;
}
