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
          <span className="hero-role">Software Developer</span>
        </p>
        <h1 className="hero-claim">
          Standard RAG answers questions.<br />
          I'm building a system that <em>investigates</em> them.
        </h1>
        <p className="hero-desc">
          An agentic research system that tracks hypotheses,
          maps contradictions, and knows when it's done.
        </p>
        <div className="hero-chips">
          <span className="chip chip--anchor">Bhaktapur, Nepal</span>
          <span className="chip">LangGraph</span>
          <span className="chip">FastAPI</span>
          <span className="chip">Qdrant</span>
          <span className="chip">Research systems</span>
        </div>
        <div className="hero-actions">
          <Link to="/work" className="btn-primary">View My Work</Link>
          <a href="#contact" onClick={handleContactClick} className="btn-ghost">Get In Touch</a>
        </div>
        <p className="hero-now">
          <span className="hero-now-label">Currently</span>
          <span className="hero-now-text">Building <a href="https://github.com/Saurab-Shrestha/NeuralNoodle" target="_blank" rel="noreferrer">NeuralNoodle</a> · LangGraph · Qdrant · FastAPI</span>
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
                height={901}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="photo-frame-meta photo-frame-meta--tl">
              <span>Focus</span>
              <strong>Agentic RAG</strong>
            </div>
            <div className="photo-frame-meta photo-frame-meta--br">
              <span>Based in</span>
              <strong>Nepal</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
