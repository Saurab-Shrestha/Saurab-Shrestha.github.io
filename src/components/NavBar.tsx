import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { asset } from '../lib/asset';

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    closeMenu();

    if (location.pathname !== '/') {
      navigate('/' + target);
    } else {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav id="main-nav" className={isScrolled ? 'scrolled' : ''}>
        <Link to="/" className="nav-logo" onClick={() => closeMenu()}>
          Saurab <span className="nav-logo-dot">·</span>
        </Link>
        <ul className="nav-links">
          <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')}>About</a></li>
          <li><a href="#timeline" onClick={(e) => handleNavClick(e, '#timeline')}>Journey</a></li>
          <li><Link to="/work" onClick={closeMenu}>Work</Link></li>
          <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
          <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contact</a></li>
        </ul>
        <div className="nav-right">
          <a href={asset('assets/Saurab-Shrestha-CV.pdf')} target="_blank" rel="noopener noreferrer" className="nav-cta">Resume →</a>
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
      <div
        className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
        id="mobile-menu"
      >
        <a href="#about" className="mobile-link" onClick={(e) => handleNavClick(e, '#about')}>About</a>
        <a href="#timeline" className="mobile-link" onClick={(e) => handleNavClick(e, '#timeline')}>Journey</a>
        <Link to="/work" className="mobile-link" onClick={closeMenu}>Work</Link>
        <Link to="/blog" className="mobile-link" onClick={closeMenu}>Blog</Link>
        <a href="#contact" className="mobile-link" onClick={(e) => handleNavClick(e, '#contact')}>Contact</a>
        <a href={asset('assets/Saurab-Shrestha-CV.pdf')} target="_blank" rel="noopener noreferrer" className="mobile-link" style={{ color: 'var(--accent)' }}>Resume →</a>
      </div>
    </>
  );
};

export default NavBar;