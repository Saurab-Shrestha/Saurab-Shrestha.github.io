import React from 'react';

type Track = 'education' | 'experience';

interface TimelineItem {
  /** Display string, e.g. "2018 — 2023" or "2023 — Present". */
  year: string;
  /** Start year, used for ordering. */
  from: number;
  /** End year; null means ongoing. */
  to: number | null;
  track: Track;
  title: string;
  org: string;
  desc: string;
  status?: 'current' | 'completed' | 'showcased';
}

const TRACK_LABEL: Record<Track, string> = {
  education: 'Education',
  experience: 'Experience',
};

const ITEMS: TimelineItem[] = [
  {
    year: '2023 — Present',
    from: 2023, to: null,
    track: 'experience',
    title: 'Asst. Software Engineer',
    org: 'Quickfox Consulting',
    desc: 'Building full-stack web applications and AI-powered chatbots for clients. Delivered chatbots, automation scripts, and ML-based solutions.',
    status: 'current',
  },
  {
    year: '2023',
    from: 2023, to: 2023,
    track: 'experience',
    title: 'Signature Verification System',
    org: 'University Final Year Project',
    desc: 'CNN-based signature verification achieving high accuracy. Presented at the university annual tech showcase.',
    status: 'showcased',
  },
  {
    year: '2022',
    from: 2022, to: 2022,
    track: 'experience',
    title: 'Tomato Disease Detection',
    org: 'Personal Research Project',
    desc: 'Computer vision model for plant pathology detection. Transfer learning on a small dataset using fast.ai small-data techniques.',
  },
  {
    year: '2021 — 2023',
    from: 2021, to: 2023,
    track: 'education',
    title: 'Self-Directed Learning',
    org: 'Online — Coursera / fast.ai',
    desc: 'Deep learning, modern web architectures, and ML engineering. Certifications in full-stack development and machine learning from global platforms.',
    status: 'completed',
  },
  {
    year: '2018 — 2023',
    from: 2018, to: 2023,
    track: 'education',
    title: 'BSc Computer Science and Information Technology',
    org: 'Bhaktapur Multiple Campus',
    desc: 'Focused on algorithms, data structures, and artificial intelligence. Consistently among top performers in the cohort.',
    status: 'completed',
  },
  {
    year: '2016 — 2018',
    from: 2016, to: 2018,
    track: 'education',
    title: 'Higher Secondary (+2 Science)',
    org: 'Premier College',
    desc: 'Science stream, 3.38 GPA. Strong foundation in mathematics and physics — the lens I still use for ML problems.',
    status: 'completed',
  },
];

/**
 * Most recent first, by start year — so the year column reads as a strictly
 * descending sequence. Sorting by end year instead put a one-off 2022 project
 * below a 2018-2023 degree. Ongoing entries win ties.
 */
const ordered = [...ITEMS].sort((a, b) => b.from - a.from || (b.to ?? Infinity) - (a.to ?? Infinity));

const JourneyTimeline: React.FC = () => (
  <>
    <div className="section-divider" />

    <section id="timeline" className="tl-section">
      <div className="tl-header">
        <div className="section-label">
          <span className="num">02</span> Journey
        </div>
        <h2>Education &amp; <em>Experience</em></h2>
        <p className="tl-header-p">
          From university coursework to building real-world AI applications.
        </p>
      </div>

      <ol className="tl-spine">
        {ordered.map((item, i) => (
          <li key={`${item.title}-${i}`} className={`tl-entry tl-entry--${item.track} reveal`}>
            <div className="tl-marker" aria-hidden="true">
              <span className="tl-dot" />
            </div>

            <div className="tl-entry-body">
              <div className="tl-entry-head">
                <span className="tl-year">{item.year}</span>
                <span className="tl-track">{TRACK_LABEL[item.track]}</span>
                {item.status && (
                  <span className={`tl-badge tl-badge--${item.status}`}>
                    {item.status === 'current' ? 'Current'
                      : item.status === 'showcased' ? 'Showcased'
                        : 'Completed'}
                  </span>
                )}
              </div>
              <h3 className="tl-title">{item.title}</h3>
              <p className="tl-org">{item.org}</p>
              <p className="tl-desc">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  </>
);

export default JourneyTimeline;
