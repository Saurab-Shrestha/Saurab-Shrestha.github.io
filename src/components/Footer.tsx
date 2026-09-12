import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { appConfig } from '../../config/app.config';
import { asset } from '../lib/asset';
import ThemeToggle from './ThemeToggle';

const Footer: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-colophon">
        {/* Column 1: Identity, Role, Telemetry */}
        <div className="footer-identity">
          <div className="footer-profile-head">
            <img
              src={asset('assets/saurab-me-avatar.webp')}
              alt="Saurab Shrestha"
              className="footer-avatar"
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
            />
            <div>
              <p className="footer-name">Saurab Shrestha</p>
              <p className="footer-role">AI / ML Engineer</p>
            </div>
          </div>

          <p className="footer-bio">
            Building agentic research systems, stateful AI workflows, and resilient full-stack products.
          </p>

          <div className="footer-telemetry">
            <span className="telemetry-dot" aria-hidden="true" />
            <span className="telemetry-text">
              Bhaktapur, Nepal · {timeString ? `${timeString} NPT` : 'NPT (UTC+5:45)'}
            </span>
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="footer-nav-col">
          <p className="footer-col-label">Navigation</p>
          <ul className="footer-links-list">
            <li><Link to="/work">Selected Work</Link></li>
            <li><Link to="/blog">Writing &amp; Notes</Link></li>
            <li><a href="#about">About &amp; Stack</a></li>
            <li><a href="#contact">Get In Touch</a></li>
            <li>
              <a
                href={asset('assets/Saurab-Shrestha-CV.pdf')}
                target="_blank"
                rel="noopener noreferrer"
              >
                Curriculum Vitae <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Network */}
        <div className="footer-nav-col">
          <p className="footer-col-label">Network</p>
          <ul className="footer-links-list">
            <li>
              <a href={appConfig.social.github} target="_blank" rel="noreferrer">
                GitHub <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={appConfig.social.linkedin} target="_blank" rel="noreferrer">
                LinkedIn <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={`mailto:${appConfig.contact.email}`}>
                Email <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Saurab Shrestha. All rights reserved.
        </p>
        <div className="footer-bottom-actions">
          <ThemeToggle />
          <button
            type="button"
            onClick={scrollToTop}
            className="footer-back-to-top"
            aria-label="Back to top of page"
          >
            Top <ArrowUp size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
