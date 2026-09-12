import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import SkeletonLoader from './components/SkeletonLoader';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import { asset } from './lib/asset';

// Home is eagerly imported: it's the landing route, so splitting it saves
// almost no one a download while costing an extra round-trip and a large layout
// shift as the short Suspense fallback is replaced by the full page (measured
// CLS 0.32, well past the 0.1 threshold).
import Home from './pages/Home';

const Work = lazy(() => import('./pages/Work'));
const Blog = lazy(() => import('./pages/Blog'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

const RESUME_PATH = 'assets/Saurab-Shrestha-CV.pdf';

const ResumeRedirect: React.FC = () => {
  useEffect(() => {
    window.location.href = asset(RESUME_PATH);
  }, []);
  return null;
};

/**
 * Scroll to top on navigation, except when the URL carries a hash — the target
 * page handles scrolling to that element itself.
 * Replaces the useEffect that was duplicated across all four inner pages.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <MainLayout>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="pt-32 pb-24 px-4 container mx-auto max-w-5xl">
              <SkeletonLoader type="card" count={2} />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/:id" element={<ProjectDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/resume" element={<ResumeRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </MainLayout>
    </Router>
  );
};

export default App;
