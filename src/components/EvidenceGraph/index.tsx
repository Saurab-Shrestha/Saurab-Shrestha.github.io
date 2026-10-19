import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { PramanaThumbnail } from '../ProjectThumbnail';
import { EVIDENCE, HYPOTHESIS } from './graphData';

const GraphScene = lazy(() => import('./GraphScene'));

/** three.js is ~150KB gzip; it should never load for someone who won't see it. */
function useShouldRender3D(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 768px)').matches;
    if (reduce || small) { setOk(false); return; }

    // Feature-detect rather than assume: WebGL can be absent or blocked.
    let supported = false;
    try {
      const canvas = document.createElement('canvas');
      supported = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      supported = false;
    }
    setOk(supported);
  }, []);

  return ok;
}

/**
 * Scroll-driven Evidence Graph for the Pramana case study.
 *
 * Lives only here, never on the homepage: the 3D bundle stays off the landing
 * page's critical path entirely. The static SVG is both the pre-load placeholder
 * and the permanent render for reduced-motion, small screens, and no-WebGL — so
 * there is no second asset to maintain.
 */
const EvidenceGraph: React.FC = () => {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const render3D = useShouldRender3D();

  const supports = EVIDENCE.filter(e => e.polarity === 'supports');
  const contradicts = EVIDENCE.filter(e => e.polarity === 'contradicts');

  return (
    <figure className="eg" ref={ref}>
      <div className="eg-stage">
        <div className="eg-fallback" data-hidden={render3D === true}>
          <PramanaThumbnail />
        </div>

        {render3D && (
          <Suspense fallback={null}>
            <GraphScene progress={progress} />
          </Suspense>
        )}

        <div className="eg-legend" aria-hidden="true">
          <span className="eg-key eg-key--supports">supports</span>
          <span className="eg-key eg-key--contradicts">contradicts</span>
        </div>
      </div>

      {/*
        The graph is decorative on its own; the argument it encodes is not.
        This is the real content — everyone gets it, not just sighted users with
        WebGL.
      */}
      <figcaption className="eg-caption">
        <p className="eg-hypothesis">
          <span className="eg-hypothesis-label">Hypothesis</span>
          {HYPOTHESIS.label}
        </p>

        <div className="eg-columns">
          <div>
            <p className="eg-col-head eg-col-head--supports">
              Supporting evidence ({supports.length})
            </p>
            <ul>
              {supports.map(e => (
                <li key={e.id}>
                  {e.label}
                  <cite>{e.source}</cite>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eg-col-head eg-col-head--contradicts">
              Contradicting evidence ({contradicts.length})
            </p>
            <ul>
              {contradicts.map(e => (
                <li key={e.id}>
                  {e.label}
                  <cite>{e.source}</cite>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="eg-note">
          An illustrative Investigation over the transformer literature — the same
          example this case study opens with. Claims are attributable to published
          papers; it is not a captured Pramana run.
        </p>
      </figcaption>
    </figure>
  );
};

export default EvidenceGraph;
