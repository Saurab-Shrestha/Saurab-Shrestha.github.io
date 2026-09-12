import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';
import { appConfig } from '../../config/app.config';
import { asset } from '../lib/asset';
import ThemeToggle from './ThemeToggle';

const Footer: React.FC = () => {
  const socialLinks = [
    { label: 'LinkedIn', href: appConfig.social.linkedin, icon: Linkedin },
    { label: 'GitHub', href: appConfig.social.github, icon: Github },
    { label: 'Resume', href: asset('assets/Saurab-Shrestha-CV.pdf'), text: 'CV' },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-connect">
        <div className="footer-profile">
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
              <p>AI Engineer</p>
            </div>
          </div>

          <div className="footer-contact-block">
            <p className="footer-block-label">Contact me</p>
            <div className="footer-contact-links">
              <a href={`mailto:${appConfig.contact.email}`}>
                <Mail size={15} aria-hidden="true" />
                {appConfig.contact.email}
              </a>
              <a href={`tel:${appConfig.contact.phone.replace(/\s/g, '')}`}>
                <Phone size={15} aria-hidden="true" />
                {appConfig.contact.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-cta-copy">
          <h2>Let's Connect</h2>
          <p>Feel free to reach out for collaborations, project ideas, or a friendly hello.</p>

          <nav className="footer-socials" aria-label="Social links">
            {socialLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                {link.icon ? <link.icon size={16} aria-hidden="true" /> : <span>{link.text}</span>}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Made with <span aria-label="love">♥</span> by Saurab</p>
        <ThemeToggle />
        <nav className="footer-mini-nav" aria-label="Footer navigation">
          {[
            { label: 'Work', to: '/work' },
            { label: 'Writing', to: '/blog' },
            { label: 'Contact', to: '/#contact' },
          ].map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
