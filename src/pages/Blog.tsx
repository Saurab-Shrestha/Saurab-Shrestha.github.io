import React from 'react';
import { Link } from 'react-router-dom';
import { useRouteContentReady } from '../lib/routeReady';
import { BLOGS_LIST, isoDate } from '../data/content';

const Blog: React.FC = () => {
  useRouteContentReady();

  return (
    <section id="blog" className="blog-page">
      <div className="writing-header">
        <div>
          <div className="section-label"><span className="num">04</span> Writing</div>
          <h1>The engineering<br /><em>journal</em></h1>
          <p className="writing-intro">
            Notes from the desk. Long-form on the systems I'm building, the dead-ends I learn from, and the parts of the stack I find myself returning to.
          </p>
        </div>
      </div>

      <div className="writing-list">
        {BLOGS_LIST.map((post, i) => (
          <Link key={post.id} to={`/blog/${post.id}`} className="writing-entry reveal">
            <span className="writing-entry-num">{String(i + 1).padStart(2, '0')}</span>
            <div className="writing-entry-main">
              <h3 className="writing-entry-title">{post.title}</h3>
              <p className="writing-entry-excerpt">{post.excerpt}</p>
            </div>
            <div className="writing-entry-meta">
              <span className="writing-entry-tag">{post.tag}</span>
              <span className="writing-entry-time">
                <time dateTime={isoDate(post.date)}>{post.date}</time>
                {' · '}{post.readTime}
              </span>
            </div>
            <span className="writing-entry-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Blog;
