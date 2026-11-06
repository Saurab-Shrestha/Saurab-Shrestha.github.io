import React from 'react';
import { asset } from '../lib/asset';

/**
 * Project thumbnails, referenced from project frontmatter by a `thumbnail` key:
 *   "svg:pramana"      -> the inline SVG below
 *   "img:assets/<file>.webp" -> a file in public/
 *
 * Single source of truth: ProjectsSection, Work, and ProjectDetail all render
 * through <ProjectThumbnail>. These SVGs used to be duplicated verbatim between
 * ProjectsSection.tsx and Work.tsx.
 */

const PramanaThumbnail: React.FC = () => (
  <svg
    viewBox="0 0 480 270"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    <rect width="480" height="270" fill="var(--surface)" />
    {/* Grid */}
    <line x1="0" y1="135" x2="480" y2="135" stroke="var(--border)" strokeWidth="1" />
    <line x1="240" y1="0" x2="240" y2="270" stroke="var(--border)" strokeWidth="1" />
    {/* Evidence nodes */}
    <circle cx="120" cy="80" r="5" fill="rgba(255,92,53,0.9)" />
    <circle cx="240" cy="50" r="5" fill="rgba(255,92,53,0.9)" />
    <circle cx="360" cy="80" r="5" fill="rgba(255,92,53,0.6)" />
    <circle cx="80" cy="155" r="5" fill="rgba(92,232,200,0.8)" />
    <circle cx="200" cy="175" r="5" fill="rgba(92,232,200,0.8)" />
    <circle cx="320" cy="160" r="5" fill="rgba(92,232,200,0.6)" />
    <circle cx="420" cy="145" r="5" fill="rgba(92,232,200,0.5)" />
    {/* Central hypothesis node */}
    <circle cx="240" cy="135" r="10" fill="rgba(255,92,53,0.15)" stroke="rgba(255,92,53,0.7)" strokeWidth="1.5" />
    {/* Supporting edges (solid) */}
    <line x1="120" y1="80" x2="240" y2="135" stroke="rgba(255,92,53,0.35)" strokeWidth="1" />
    <line x1="240" y1="50" x2="240" y2="125" stroke="rgba(255,92,53,0.45)" strokeWidth="1" />
    <line x1="80" y1="155" x2="230" y2="135" stroke="rgba(92,232,200,0.3)" strokeWidth="1" />
    <line x1="200" y1="175" x2="240" y2="145" stroke="rgba(92,232,200,0.3)" strokeWidth="1" />
    {/* Contradicting edges (dashed) */}
    <line x1="360" y1="80" x2="250" y2="135" stroke="rgba(255,184,77,0.4)" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="320" y1="160" x2="250" y2="140" stroke="rgba(255,184,77,0.35)" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="420" y1="145" x2="250" y2="137" stroke="rgba(255,184,77,0.25)" strokeWidth="1" strokeDasharray="3 3" />
    {/* Labels */}
    <text x="240" y="134" fontFamily="monospace" fontSize="7" fill="rgba(255,92,53,0.9)" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">H</text>
    <text x="240" y="222" fontFamily="monospace" fontSize="8" fill="rgba(255,92,53,0.4)" letterSpacing="2" textAnchor="middle">EVIDENCE GRAPH</text>
    <text x="370" y="210" fontFamily="monospace" fontSize="7" fill="rgba(255,184,77,0.5)" letterSpacing="1" textAnchor="middle">contradicts</text>
    <text x="110" y="210" fontFamily="monospace" fontSize="7" fill="rgba(92,232,200,0.5)" letterSpacing="1" textAnchor="middle">supports</text>
    {/* Legend lines */}
    <line x1="58" y1="207" x2="76" y2="207" stroke="rgba(92,232,200,0.4)" strokeWidth="1" />
    <line x1="328" y1="207" x2="346" y2="207" stroke="rgba(255,184,77,0.4)" strokeWidth="1" strokeDasharray="3 3" />
  </svg>
);
const SvufeThumbnail: React.FC = () => (
  <svg
    viewBox="0 0 480 270"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    <rect width="480" height="270" fill="var(--surface2)" />
    {/* Grid */}
    <line x1="0" y1="135" x2="480" y2="135" stroke="var(--border)" strokeWidth="1" />
    <line x1="240" y1="0" x2="240" y2="270" stroke="var(--border)" strokeWidth="1" />
    {/* Signature A — irregular waveform */}
    <polyline
      points="32,160 60,100 88,175 116,85 144,155 172,110 200,165 228,95 240,135"
      fill="none"
      stroke="rgba(255,92,53,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Signature B — offset, slightly different rhythm */}
    <polyline
      points="240,135 256,90 284,168 312,88 340,158 368,102 396,162 424,92 452,135"
      fill="none"
      stroke="rgba(92,232,200,0.5)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Divider */}
    <line x1="240" y1="60" x2="240" y2="210" stroke="var(--border2)" strokeWidth="1" strokeDasharray="4 4" />
    {/* Verified badge */}
    <circle cx="390" cy="52" r="22" fill="rgba(29,158,117,0.15)" stroke="rgba(92,232,200,0.4)" strokeWidth="1" />
    <polyline
      points="381,52 388,59 401,45"
      fill="none"
      stroke="#5ce8c8"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Label A */}
    <text x="116" y="218" fontFamily="monospace" fontSize="9" fill="rgba(255,92,53,0.5)" letterSpacing="2" textAnchor="middle">SAMPLE A</text>
    {/* Label B */}
    <text x="364" y="218" fontFamily="monospace" fontSize="9" fill="rgba(92,232,200,0.45)" letterSpacing="2" textAnchor="middle">SAMPLE B</text>
    {/* Match label */}
    <text x="390" y="88" fontFamily="monospace" fontSize="8" fill="rgba(92,232,200,0.6)" letterSpacing="1.5" textAnchor="middle">MATCH</text>
  </svg>
);
/** Letter → extracted names → ranked customer matches → maker and checker. */
const ComplianceThumbnail: React.FC = () => {
  const mono = { fontFamily: 'var(--font-mono)' };
  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect width="480" height="270" fill="var(--surface)" />
      <line x1="0" y1="135" x2="480" y2="135" stroke="var(--border)" strokeWidth="1" />

      {/* The letter */}
      <rect x="36" y="62" width="92" height="120" fill="var(--bg)" stroke="var(--border2)" />
      <line x1="48" y1="80" x2="96" y2="80" stroke="var(--text)" strokeOpacity="0.5" strokeWidth="2" />
      {[96, 106, 116, 140, 150, 160].map(y => (
        <line key={y} x1="48" y1={y} x2="116" y2={y} stroke="var(--border2)" strokeWidth="2" />
      ))}
      <rect x="46" y="124" width="58" height="8" fill="var(--accent)" fillOpacity="0.25" />

      {/* Extracted subject → ranked candidates */}
      <line x1="128" y1="128" x2="176" y2="128" stroke="var(--accent)" strokeOpacity="0.6" strokeDasharray="3 3" />
      {[{ y: 92, w: 120, top: true }, { y: 120, w: 84 }, { y: 148, w: 60 }, { y: 176, w: 38 }].map(c => (
        <g key={c.y}>
          <rect x="180" y={c.y} width="140" height="18" fill="var(--bg)" stroke={c.top ? 'var(--accent)' : 'var(--border)'} />
          <rect x="186" y={c.y + 7} width={c.w} height="4" fill={c.top ? 'var(--accent)' : 'var(--border2)'} />
        </g>
      ))}

      {/* Maker, then checker */}
      <line x1="320" y1="101" x2="362" y2="101" stroke="var(--border2)" />
      {[{ x: 382, label: 'maker' }, { x: 432, label: 'checker' }].map(s => (
        <g key={s.label}>
          <circle cx={s.x} cy="101" r="15" fill="var(--bg)" stroke="var(--accent3)" strokeWidth="1.5" />
          <polyline
            points={`${s.x - 6},101 ${s.x - 1},106 ${s.x + 7},96`}
            fill="none" stroke="var(--accent3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          <text x={s.x} y="134" fontSize="9" fill="var(--muted)" textAnchor="middle" style={mono}>{s.label}</text>
        </g>
      ))}
      <line x1="397" y1="101" x2="417" y2="101" stroke="var(--border2)" />

      <text x="82" y="206" fontSize="9" fill="var(--muted)" textAnchor="middle" style={mono}>letter</text>
      <text x="250" y="214" fontSize="9" fill="var(--muted)" textAnchor="middle" style={mono}>ranked matches</text>
    </svg>
  );
};

const SVGS: Record<string, React.FC> = {
  pramana: PramanaThumbnail,
  svufe: SvufeThumbnail,
  compliance: ComplianceThumbnail,
};

interface Props {
  /** Frontmatter `thumbnail` value. */
  spec: string;
  /** Project name, used to build the img alt text. */
  name: string;
}

const ProjectThumbnail: React.FC<Props> = ({ spec, name }) => {
  const [kind, value] = spec.split(':');

  if (kind === 'svg') {
    const Svg = SVGS[value];
    return Svg ? <Svg /> : null;
  }

  if (kind === 'img') {
    // Raster screenshots are light-UI captures. Dropped edge-to-edge onto a dark
    // page they read as blown-out rectangles, so they sit inside a window frame
    // that marks them as screenshots rather than page background.
    //
    // No address bar: these projects have no public URL, and simulating one
    // would invent a destination that doesn't exist.
    return (
      <div className="browser-mockup">
        <div className="browser-chrome" aria-hidden="true">
          <span className="browser-dots">
            <i /><i /><i />
          </span>
        </div>
        <div className="browser-viewport">
          <img
            src={asset(value)}
            alt={`${name} — screenshot of the running application`}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    );
  }

  return null;
};

export { PramanaThumbnail };
export default ProjectThumbnail;
