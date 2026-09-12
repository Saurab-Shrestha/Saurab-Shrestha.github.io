import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const scrollProgRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate refs
  const mousePos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    // 1. Cursor handling
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.mx = e.clientX;
      mousePos.current.my = e.clientY;
    };
    
    document.addEventListener('mousemove', handleMouseMove);

    // Tuned lerp — a touch slower than 0.12 gives the ring more "trail"
    // behind the dot, reads as smoother.
    const animateCursor = () => {
      const pos = mousePos.current;
      pos.rx += (pos.mx - pos.rx) * 0.16;
      pos.ry += (pos.my - pos.ry) * 0.16;

      if (cursorDotRef.current && cursorRingRef.current) {
        cursorDotRef.current.style.left = pos.mx + 'px';
        cursorDotRef.current.style.top = pos.my + 'px';
        cursorRingRef.current.style.left = pos.rx + 'px';
        cursorRingRef.current.style.top = pos.ry + 'px';
      }
      animationFrameId.current = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // 2. Scroll Progress
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollY / docHeight : 0;
      if (scrollProgRef.current) {
        scrollProgRef.current.style.transform = `scaleX(${pct})`;
      }
    };
    window.addEventListener('scroll', handleScroll);

    // 3. Scroll Reveal — in/out with staggered entrance
    const observed = new WeakSet<Element>();
    const io = new IntersectionObserver((entries) => {
      // Only stagger entering elements; exits should be immediate-ish so they don't
      // feel laggy when scrolling fast in the other direction.
      const entering = entries.filter(e => e.isIntersecting);
      entering.forEach((e, i) => {
        const el = e.target as HTMLElement;
        el.classList.remove('exit');
        // Cap the stagger so a long batch doesn't feel like a wave.
        const delay = Math.min(i, 6) * 90;
        setTimeout(() => el.classList.add('visible'), delay);
      });
      entries.filter(e => !e.isIntersecting).forEach(e => {
        const el = e.target as HTMLElement;
        if (el.classList.contains('visible')) {
          el.classList.remove('visible');
          el.classList.add('exit');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const observeAll = () => {
      document.querySelectorAll('.reveal, .reveal-left, .tl-item').forEach(el => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };
    observeAll();

    // Watch for elements added later (lazy routes, Suspense fallback → real content)
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('scroll', handleScroll);
      io.disconnect();
      mo.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="portfolio-2026 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>

      {/* CURSOR */}
      <div id="cursor-dot" ref={cursorDotRef}></div>
      <div id="cursor-ring" ref={cursorRingRef}></div>

      {/* SCROLL PROGRESS */}
      <div id="scroll-progress" ref={scrollProgRef}></div>

      <NavBar />
      
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;