import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { appConfig } from '../../config/app.config';
import { asset } from '../lib/asset';
import ThemeToggle from './ThemeToggle';
import LocalTime from './LocalTime';

const Footer: React.FC = () => {
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

          <dl className="footer-where">
            <div>
              <dt>Based in</dt>
              <dd>Bhaktapur, Nepal</dd>
            </div>
            <div>
              <dt>Local time</dt>
              <dd><LocalTime /></dd>
            </div>
          </dl>
        </div>

        {/* Column 2: Navigation */}
        <div className="footer-nav-col">
          <p className="footer-col-label">Navigation</p>
          <ul className="footer-links-list">
            <li><Link to="/work">Selected work</Link></li>
            <li><Link to="/blog">Writing &amp; Notes</Link></li>
            <li><a href="#about">About &amp; Stack</a></li>
            <li><a href="#contact">Get in touch</a></li>
            <li>
              <a
                href={asset('assets/Saurab-Shrestha-CV.pdf')}
                target="_blank"
                rel="noopener noreferrer"
              >
                Curriculum vitae <ArrowUpRight size={13} aria-hidden="true" />
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
        <ThemeToggle />
      </div>
    </footer>
  );
};

export default Footer;
