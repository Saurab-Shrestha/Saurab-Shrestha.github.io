import React from 'react';
import { appConfig } from '../../../config/app.config';
import LocalTime from '../../components/LocalTime';

/**
 * Capability groups.
 *
 * These are the five rows that were already in the skills table, regrouped by
 * domain — the wording is unchanged. Nothing has been added: a stack list on a
 * portfolio is a claim, and every entry here is one the rest of the site backs up.
 */
const STACK: Array<{ group: string; items: Array<{ name: string; note: string }> }> = [
  {
    group: 'AI & agents',
    items: [
      { name: 'LangGraph', note: 'stateful agent pipelines' },
      { name: 'Qdrant / PyTorch', note: 'vector search + model training' },
      { name: 'OpenCV', note: 'computer vision systems' },
    ],
  },
  {
    group: 'Backend & product',
    items: [
      { name: 'Python', note: 'ML, backend, automation' },
      { name: 'React / FastAPI', note: 'full-stack delivery' },
    ],
  },
];

const SPEC = [
  { label: 'Location', value: 'Bhaktapur, Nepal' },
  { label: 'Focus', value: 'AI/ML & full-stack' },
  { label: 'Currently on', value: 'NeuralNoodle — agentic research system' },
  { label: 'Open to', value: 'Remote · Contract · Full-time' },
];

const AboutSection: React.FC = () => (
  <>
    <div className="section-divider"></div>

    <section id="about">
      <div className="about-head reveal">
        <div className="section-label">
          <span className="num">01</span> About
        </div>
        <h2>Passionate about<br /><em>building things</em><br />that matter.</h2>
      </div>

      <div className="bento">
        {/* ── Narrative ── */}
        <article className="bento-cell bento-cell--story reveal">
          <p className="about-body">
            I build full-stack systems with a deep lean into AI and machine learning,
            based in Bhaktapur, Nepal. My work sits at the intersection of rigorous
            engineering and product thinking — systems that hold under pressure and
            feel good to use.
          </p>
          <p className="about-body">
            I care about the whole stack: from model training to the pixel on screen.
            That end-to-end ownership is what makes the work interesting.
          </p>
        </article>

        {/* ── Availability ── */}
        <article className="bento-cell bento-cell--status reveal">
          <p className="bento-label">Availability</p>
          <p className="status-line">
            <span className="status-dot" aria-hidden="true" />
            Available for opportunities
          </p>
          <dl className="status-meta">
            <div>
              <dt>Local time</dt>
              <dd><LocalTime /></dd>
            </div>
            <div>
              <dt>Open to</dt>
              <dd>Remote · Contract · Full-time</dd>
            </div>
          </dl>
          <a className="status-email" href={`mailto:${appConfig.contact.email}`}>
            {appConfig.contact.email}
          </a>
        </article>

        {/* ── Capabilities ── */}
        <article className="bento-cell bento-cell--stack reveal">
          <p className="bento-label">What I work in</p>
          {STACK.map(({ group, items }) => (
            <div key={group} className="stack-group">
              <p className="stack-group-name">{group}</p>
              <ul className="stack-items">
                {items.map(({ name, note }) => (
                  <li key={name}>
                    <span className="stack-name">{name}</span>
                    <span className="stack-note">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </article>

        {/* ── Spec sheet ── */}
        <article className="bento-cell bento-cell--spec reveal">
          <p className="bento-label">Details</p>
          <dl className="spec-rows">
            {SPEC.map(({ label, value }) => (
              <div key={label} className="spec-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  </>
);

export default AboutSection;
