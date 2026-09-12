import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRouteContentReady } from '../lib/routeReady';
import HeroSection from '../features/home/HeroSection';
import AboutSection from '../features/home/AboutSection';
import JourneyTimeline from '../features/home/JourneyTimeline';
import ProjectsSection from '../features/home/ProjectsSection';
import BlogSection from '../features/home/BlogSection';
import ContactSection from '../features/home/ContactSection';

const Home: React.FC = () => {
  const { hash } = useLocation();
  useRouteContentReady();

  // Reveal is handled once, in MainLayout via useScrollReveal. This effect only
  // resolves an incoming #hash.
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <>
      <div className="app-bloom app-bloom-warm" />
      <div className="app-bloom app-bloom-cool" />
      <HeroSection />
      <div id="about">
        <AboutSection />
      </div>
      <JourneyTimeline />
      <ProjectsSection />
      <BlogSection />
      <div id="contact">
        <ContactSection />
      </div>
    </>
  );
};

export default Home;