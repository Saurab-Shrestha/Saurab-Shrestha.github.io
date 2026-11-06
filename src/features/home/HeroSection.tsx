import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { asset } from '../../lib/asset';

const HeroSection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#contact');
    } else {
      const el = document.querySelector('#contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-grid-lines"></div>

      <div className="hero-left">
        <div className="hero-tag"><span className="blink"></span> Available for opportunities</div>
        <p className="hero-byline">
          <span className="hero-name">Saurab Shrestha</span>
          <span className="hero-role">AI / ML Engineer</span>
        </p>
        <h1 className="hero-claim">
          <span className="hero-claim-line">Standard RAG answers questions.</span>
          <span className="hero-claim-line">I'm building a system that <em>investigates</em> them.</span>
        </h1>
        <p className="hero-desc">
          An agentic research system that tracks hypotheses,
          checks its answers for contradictions, and cites every claim.
        </p>
        <div className="hero-actions">
          <Link to="/work" className="btn-primary">View my work</Link>
          <a href="#contact" onClick={handleContactClick} className="btn-ghost">Get in touch</a>
        </div>
        <p className="hero-now">
          <span className="hero-now-label">Currently</span>
          <span className="hero-now-text">Building <a href="https://github.com/Saurab-Shrestha/Pramana" target="_blank" rel="noreferrer">Pramana</a> · LangGraph · Qdrant · FastAPI</span>
        </p>
      </div>

      <div className="hero-right">
        <div className="hero-right-inner">
          <div className="photo-frame">
            <div className="photo-inner">
              <img
                src={asset('assets/saurab-me.webp')}
                alt="Saurab Shrestha"
                width={900}
                height={900}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="photo-frame-meta photo-frame-meta--tl">
              <span>Focus</span>
              <strong>Agentic RAG</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
