import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BLOGS_CONTENT, BLOGS_LIST, isoDate } from '../data/content';
import { asset } from '../lib/asset';
import BlogLayout from '../components/BlogLayout';
import NotFound from './NotFound';

const BlogPost: React.FC = () => {
  const { id } = useParams();
  const post = id ? BLOGS_CONTENT[id] : undefined;
  const [copied, setCopied] = useState(false);

  if (!post) {
    return <NotFound kind="post" backTo="/blog" backLabel="Browse all writing" />;
  }

  const pos = BLOGS_LIST.findIndex(p => p.id === post.id);
  const prev = BLOGS_LIST[pos - 1]; // newer
  const next = BLOGS_LIST[pos + 1]; // older

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareLinks = [
    {
      label: 'Twitter / X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <article className="blog-post-page">
      <div className="detail-head detail-head--wide">
        <div className="blog-breadcrumb">
          <Link to="/blog" className="blog-breadcrumb-link">← Writing</Link>
          <span className="blog-breadcrumb-sep" aria-hidden="true">/</span>
          <span className="blog-tag-pill">{post.tag}</span>
        </div>

        <h1 className="detail-title detail-title--post">{post.title}</h1>
        <div className="detail-meta-inline">
          <time dateTime={isoDate(post.date)}>{post.date}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime}</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="blog-copy-link-btn"
            aria-label="Copy link to article"
          >
            {copied ? 'Copied ✓' : 'Share link'}
          </button>
        </div>

        <div className="detail-rule" />
      </div>

      <BlogLayout content={post.markdown} basePath={`/blog/${post.id}`} />

      <footer className="post-footer">
        <div className="post-author-card">
          <img
            src={asset('assets/saurab-me-avatar.webp')}
            alt="Saurab Shrestha"
            className="post-author-avatar"
            width={60}
            height={60}
            loading="lazy"
            decoding="async"
          />
          <div className="post-author-info">
            <p className="post-author-name">Written by Saurab Shrestha</p>
            <p className="post-author-role">AI / ML Engineer · Bhaktapur, Nepal</p>
            <p className="post-author-bio">
              Building agentic research systems, stateful AI pipelines, and resilient full-stack applications.
            </p>
          </div>
        </div>

        <nav className="post-share" aria-label="Share this post">
          <span className="detail-meta-label">Share this post</span>
          <ul>
            {shareLinks.map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer">{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {(prev || next) && (
          <nav className="post-pager" aria-label="More posts">
            {prev ? (
              <Link to={`/blog/${prev.id}`} className="post-pager-link post-pager-link--prev">
                <span className="detail-meta-label">← Newer</span>
                <span className="post-pager-title">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/blog/${next.id}`} className="post-pager-link post-pager-link--next">
                <span className="detail-meta-label">Older →</span>
                <span className="post-pager-title">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>
        )}
      </footer>
    </article>
  );
};

export default BlogPost;
