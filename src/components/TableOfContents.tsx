import React, { useEffect, useState, useCallback, useMemo } from 'react';

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

interface TableOfContentsProps {
  headings: Heading[];
  title?: string;
}

/** Offset from the top of the viewport for scroll-to and active tracking. */
const SCROLL_OFFSET = 100;

// ── Reading progress ────────────────────────────────────────────────────────
/** Percent of the document scrolled, batched to one read per frame. */
function useReadPercent(): number {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;

    const compute = () => {
      frame = 0;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      setPct(max <= 0 ? 100 : Math.min(100, Math.max(0, (scrollTop / max) * 100)));
    };
    // The listener used to call getBoundingClientRect and setState on every
    // scroll event — unthrottled, forcing layout each time.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return pct;
}

// ── Active heading ──────────────────────────────────────────────────────────
/**
 * Tracks the heading currently being read, via IntersectionObserver rather than
 * a scroll listener — the intersection maths runs off the main thread.
 */
function useActiveHeading(headings: Heading[]): string {
  const [activeId, setActiveId] = useState('');
  const ids = useMemo(() => headings.map(h => h.id).join('|'), [headings]);

  useEffect(() => {
    const idList = ids ? ids.split('|') : [];
    const els = idList
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) return;

    const visible = new Set<string>();
    let lastPassed = els[0].id;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else {
          visible.delete(entry.target.id);
          // Scrolled past the top edge: remember it, so a long section with no
          // heading on screen still shows the heading it belongs to.
          if (entry.boundingClientRect.top < SCROLL_OFFSET) lastPassed = entry.target.id;
        }
      }
      const current = idList.find(id => visible.has(id)) ?? lastPassed;
      setActiveId(current);
    }, {
      rootMargin: `-${SCROLL_OFFSET}px 0px -70% 0px`,
      threshold: 0,
    });

    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

// ── Component ───────────────────────────────────────────────────────────────
const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  title = 'On this page',
}) => {
  // Top-level sections only. Including H3s produced 53 entries on the longest
  // post — a wall of links rather than a map of the article.
  const items = useMemo(
    () => headings.filter(h => Number(h.level) === 2),
    [headings]
  );

  const activeId = useActiveHeading(items);
  const readPercent = useReadPercent();

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
      behavior: 'smooth',
    });

    // Keep the anchor shareable and move focus to the destination — clicking a
    // TOC link used to leave keyboard users parked in the TOC with an unchanged
    // URL. replaceState avoids the browser's own instant jump.
    history.replaceState(null, '', `#${id}`);
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }, []);

  if (items.length === 0) return null;

  return (
    <aside className="toc" aria-label="Table of contents">
      <div className="toc-card">
        <p className="toc-title">{title}</p>

        <nav className="toc-nav" aria-label="Page sections">
          {items.map((h, i) => {
            const isActive = activeId === h.id;
            return (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`toc-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="toc-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="toc-text">{h.text}</span>
              </a>
            );
          })}
        </nav>

        <div className="toc-progress">
          <div className="toc-progress-head">
            <span>Reading progress</span>
            <span>{Math.round(readPercent)}%</span>
          </div>
          <div
            className="toc-progress-track"
            role="progressbar"
            aria-label="Reading progress"
            aria-valuenow={Math.round(readPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="toc-progress-bar" style={{ width: `${readPercent}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TableOfContents;
