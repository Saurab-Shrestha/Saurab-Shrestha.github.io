import React from 'react';
import { asset } from '../../lib/asset';

interface Role {
  period: string;
  title: string;
  org: string;
  desc: string;
  /** Short stack summary, shown as a pill on the right. */
  tags: string;
  current?: boolean;
}

interface Study {
  period: string;
  title: string;
  org: string;
}

/**
 * Roles, most recent first.
 *
 * Supersedes what the site previously showed — QuickFox as 2023–Present, with no
 * Bajra role and no internship. Month boundaries are worth a second look.
 */
const ROLES: Role[] = [
  {
    period: '2026 — Present',
    title: 'AI / ML Engineer',
    org: 'Bajra Technologies',
    desc: 'Building production AI systems, agentic workflows and LLM infrastructure.',
    tags: 'AI · LLM · RAG',
    current: true,
  },
  {
    period: '2023 — 2026',
    title: 'Software Engineer',
    org: 'QuickFox Consulting',
    desc: 'Built document intelligence, compliance automation and AI products.',
    tags: 'Django · React · OCR',
  },
  {
    period: 'Apr — Aug 2023',
    title: 'Intern Software Engineer',
    org: 'QuickFox Consulting',
    desc: 'Contributed to internal tools and AI integrations.',
    tags: 'Python · Django · APIs',
  },
];

/**
 * Education, deliberately compact. It matters, but someone reading this in 2026
 * looks at the last three years first — giving a 2016 school entry the same
 * weight as the current role flattened the section into a checklist.
 */
const STUDY: Study[] = [
  {
    period: '2018 — 2023',
    title: 'BSc Computer Science & Information Technology',
    org: 'Bhaktapur Multiple Campus',
  },
  {
    period: '2021 — 2023',
    title: 'Self-directed — deep learning & ML engineering',
    org: 'Coursera / fast.ai',
  },
  {
    period: '2016 — 2018',
    title: 'Higher Secondary (+2 Science)',
    org: 'Premier College',
  },
];

const JourneyTimeline: React.FC = () => (
  <>
    <div className="section-divider" />

    <section id="timeline" className="tl-section">
      <div className="rail-layout">
        {/* ── Left rail ── */}
        <div className="rail-intro reveal">
          <div className="section-label">
            <span className="num">02</span> Experience
          </div>
          <h2>Education &amp;<br /><em>Experience</em></h2>
          <p className="rail-intro-p">
            A short journey of learning, building, and growing.
          </p>
          <a
            className="rail-cta"
            href={asset('assets/Saurab-Shrestha-CV.pdf')}
            target="_blank"
            rel="noopener noreferrer"
          >
            View resume
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </a>
        </div>

        {/* ── Roles ── */}
        <div className="tl-roles">
          <ol className="role-list">
            {ROLES.map(role => (
              <li
                key={`${role.org}-${role.period}`}
                className={`role ${role.current ? 'role--current' : ''} reveal`}
              >
                <span className="role-dot" aria-hidden="true" />
                <div className="role-body">
                  <p className="role-period">
                    {role.period}
                    {role.current && <span className="role-now">Current</span>}
                  </p>
                  <h3 className="role-title">{role.title}</h3>
                  <p className="role-org">{role.org}</p>
                  <p className="role-desc">{role.desc}</p>
                </div>
                <span className="role-tags">{role.tags}</span>
              </li>
            ))}
          </ol>

          <div className="study reveal">
            <p className="study-label">Education</p>
            <ul className="study-list">
              {STUDY.map(s => (
                <li key={s.title}>
                  <span className="study-period">{s.period}</span>
                  <span className="study-title">{s.title}</span>
                  <span className="study-org">{s.org}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default JourneyTimeline;
