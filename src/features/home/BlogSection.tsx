import React from 'react';
import { Link } from 'react-router-dom';
import { BLOGS_LIST, isoDate } from '../../data/content';

/** Homepage shows the newest few; /blog has the archive. */
const FEATURED_COUNT = 3;

/**
 * Positions a CSS variable at the cursor so the row can paint a spotlight
 * under it. Set on the element directly rather than inherited from a parent —
 * a custom property on a parent recalculates styles for every child.
 */
const trackPointer = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
};

const BlogSection: React.FC = () => {
  const posts = BLOGS_LIST.slice(0, FEATURED_COUNT);

  return (
    <>
      <div className="section-divider"></div>

      <section id="blog">
        <div className="writing-header">
          <div>
            <div className="section-label">
              <span className="num">04</span> Writing
            </div>
            <h2>Notes on<br /><em>building things</em>.</h2>
            <p className="writing-intro">
              Short articles, thoughts and learnings from my journey in tech and AI.
            </p>
          </div>
          {BLOGS_LIST.length > FEATURED_COUNT && (
            <Link to="/blog" className="writing-archive-link">
              View archive
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </Link>
          )}
        </div>

        <div className="writing-list">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="writing-entry reveal"
              onMouseMove={trackPointer}
            >
              <span className="writing-entry-num">{String(i + 1).padStart(2, '0')}</span>

              <h3 className="writing-entry-title">{post.title}</h3>

              <div className="writing-entry-foot">
                <div className="writing-entry-meta">
                  <time dateTime={isoDate(post.date)}>{post.date}</time>
                  <span className="writing-entry-time">{post.readTime}</span>
                </div>
                <span className="writing-entry-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="9 7 17 7 17 15" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default BlogSection;
