import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface MainLayoutProps {
  children: React.ReactNode;
}

/** Ring trails the dot; lower is looser. */
const CURSOR_LERP = 0.16;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const scrollProgRef = useRef<HTMLDivElement>(null);

  useScrollReveal(location.pathname);

  // ── Decorative cursor ──────────────────────────────────────────────────────
  // Fine pointers only: on touch there is nothing to track, and under reduced
  // motion the trailing ring is exactly the kind of movement to drop.
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;

    const pos = { mx: 0, my: 0, rx: 0, ry: 0 };
    let frame = 0;

    const handleMouseMove = (e: MouseEvent) => {
      pos.mx = e.clientX;
      pos.my = e.clientY;
    };

    const animateCursor = () => {
      pos.rx += (pos.mx - pos.rx) * CURSOR_LERP;
      pos.ry += (pos.my - pos.ry) * CURSOR_LERP;

      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;
      // translate3d keeps both on the compositor; left/top forced layout every frame.
      if (dot) dot.style.transform = `translate3d(${pos.mx}px, ${pos.my}px, 0) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%, -50%)`;

      frame = requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    frame = requestAnimationFrame(animateCursor);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  // ── Scroll progress ────────────────────────────────────────────────────────
  // Only used where CSS scroll-driven animations are unsupported; when they are,
  // the bar is driven by animation-timeline: scroll() off the main thread.
  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      if (scrollProgRef.current) {
        scrollProgRef.current.style.transform = `scaleX(${pct})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="portfolio-2026 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>

      {/* CURSOR */}
      <div id="cursor-dot" ref={cursorDotRef} aria-hidden="true"></div>
      <div id="cursor-ring" ref={cursorRingRef} aria-hidden="true"></div>

      {/* SCROLL PROGRESS */}
      <div id="scroll-progress" ref={scrollProgRef} aria-hidden="true"></div>

      <NavBar />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default MainLayout;
