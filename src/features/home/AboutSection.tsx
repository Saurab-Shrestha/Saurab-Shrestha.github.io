import React from 'react';
import { appConfig } from '../../../config/app.config';
import LocalTime from '../../components/LocalTime';

/**
 * Capability areas.
 *
 * Grouped from what the rest of the site already evidences: Pramana for
 * agents and retrieval, the QuickFox work for document intelligence, and the
 * Django/FastAPI projects for the backend and product rows. Nothing here is a
 * claim the site doesn't back up somewhere.
 */
const AREAS: Array<{ title: string; detail: string }> = [
  { title: 'AI systems', detail: 'RAG · Agents · LLM applications' },
  { title: 'Document intelligence', detail: 'OCR · Extraction · Multimodal' },
  { title: 'Backend systems', detail: 'Python · Django · FastAPI' },
  { title: 'Product engineering', detail: 'React · APIs · Infrastructure' },
];

const DETAILS = [
  { label: 'Location', value: 'Bhaktapur, Nepal' },
  { label: 'Open to', value: 'Remote · Contract · Full-time' },
  { label: 'Currently on', value: 'Pramana — agentic research system' },
];

const AboutSection: React.FC = () => (
  <>
    <div className="section-divider"></div>

    <section id="about">
      <div className="rail-layout">
        {/* ── Left rail ── */}
        <div className="rail-intro reveal">
          <div className="section-label">
            <span className="num">01</span> About
          </div>
          <h2>Passionate about<br /><em>building things</em><br />that matter.</h2>
          <p className="rail-intro-p">
            I work at the intersection of software engineering and applied AI —
            building products that solve real problems, from model training to the
            pixel on screen.
          </p>

          <p className="status-line">
            <span className="status-dot" aria-hidden="true" />
            Available for opportunities
          </p>

          <a className="rail-cta" href={`mailto:${appConfig.contact.email}`}>
            Get in touch
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </a>
        </div>

        {/* ── Capability areas ── */}
        <div className="about-areas">
          <ol className="area-list">
            {AREAS.map((area, i) => (
              <li key={area.title} className="area reveal">
                <span className="area-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="area-body">
                  <h3 className="area-title">{area.title}</h3>
                  <p className="area-detail">{area.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="study reveal">
            <p className="study-label">Details</p>
            <ul className="study-list">
              {DETAILS.map(d => (
                <li key={d.label}>
                  <span className="study-period">{d.label}</span>
                  <span className="study-title">{d.value}</span>
                  <span className="study-org" />
                </li>
              ))}
              <li>
                <span className="study-period">Local time</span>
                <span className="study-title"><LocalTime /></span>
                <span className="study-org" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default AboutSection;
