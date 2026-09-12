import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { asset } from '../lib/asset';
import { useScrollSpy } from '../hooks/useScrollSpy';

/**
 * Nav items in display order. `projects` is tracked by the scrollspy but has no
 * nav item of its own, so scrolling into it clears the About/Journey highlight
 * rather than leaving a stale one lit.
 */
const NAV_ITEMS: Array<
  | { kind: 'section'; id: string; label: string }
  | { kind: 'route'; to: string; label: string }
> = [
  { kind: 'section', id: 'about', label: 'About' },
  { kind: 'section', id: 'timeline', label: 'Journey' },
  { kind: 'route', to: '/work', label: 'Work' },
  { kind: 'route', to: '/blog', label: 'Blog' },
  { kind: 'section', id: 'contact', label: 'Contact' },
];

/** Document order, for the scrollspy only. */
const SPY_IDS = ['about', 'timeline', 'projects', 'contact'];

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const spyIds = useMemo(() => SPY_IDS, []);
  const activeSection = useScrollSpy(spyIds, isHome);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(open => !open);
  const closeMenu = () => setIsMenuOpen(false);

  // Escape closes the menu; body scroll is locked while it's open so the page
  // behind doesn't slide around under the overlay.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    closeMenu();

    if (!isHome) {
      navigate('/#' + id);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const sectionLink = (id: string, label: string, className?: string) => {
    const current = isHome && activeSection === id;
    return (
      <a
        href={`#${id}`}
        className={[className, current ? 'is-current' : ''].filter(Boolean).join(' ')}
        aria-current={current ? 'true' : undefined}
        onClick={e => handleNavClick(e, id)}
      >
        {label}
      </a>
    );
  };

  const routeIsCurrent = (to: string) => location.pathname.startsWith(to);

  return (
    <>
      <nav id="main-nav" className={isScrolled ? 'scrolled' : ''} aria-label="Primary">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          Saurab <span className="nav-logo-dot">·</span>
        </Link>

        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.kind === 'section' ? item.id : item.to}>
              {item.kind === 'section' ? sectionLink(item.id, item.label) : (
                <Link
                  to={item.to}
                  className={routeIsCurrent(item.to) ? 'is-current' : undefined}
                  aria-current={routeIsCurrent(item.to) ? 'page' : undefined}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <a
            href={asset('assets/Saurab-Shrestha-CV.pdf')}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
          >
            Resume →
          </a>
          <button
            className={`hamburger ${isMenuOpen ? 'open' : ''}`}
            id="hamburger"
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} id="mobile-menu">
        {NAV_ITEMS.map(item => item.kind === 'section' ? (
          <React.Fragment key={item.id}>{sectionLink(item.id, item.label, 'mobile-link')}</React.Fragment>
        ) : (
          <Link key={item.to} to={item.to} className="mobile-link" onClick={closeMenu}>
            {item.label}
          </Link>
        ))}
        <a
          href={asset('assets/Saurab-Shrestha-CV.pdf')}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-link mobile-link--cta"
        >
          Resume →
        </a>
      </div>
    </>
  );
};

export default NavBar;
