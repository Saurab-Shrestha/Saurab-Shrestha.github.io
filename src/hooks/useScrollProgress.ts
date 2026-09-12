import { useEffect, useRef, useState } from 'react';

/**
 * Progress (0..1) of an element travelling through the viewport.
 *
 * 0 when the element's top reaches the bottom of the viewport, 1 when its
 * bottom reaches the top. Reads are batched to one per frame — the same
 * discipline as the TOC progress bar, rather than measuring on every event.
 *
 * Returns a ref to attach and the current progress. Progress stays at 0 under
 * prefers-reduced-motion so scroll-linked motion never starts.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Total distance travelled from "entering" to "fully exited".
      const span = rect.height + vh;
      const travelled = vh - rect.top;
      setProgress(Math.min(1, Math.max(0, travelled / span)));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    measure();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, progress };
}
