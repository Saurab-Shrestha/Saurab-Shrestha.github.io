import React from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS_LIST, type ProjectContent } from '../../data/content';
import ProjectThumbnail from '../../components/ProjectThumbnail';

/** Homepage shows the first few; /work shows everything. */
const FEATURED_COUNT = 3;

const ProjectRow: React.FC<{ project: ProjectContent; index: number }> = ({ project, index }) => (
  <Link
    to={`/work/${project.id}`}
    className={`project-row reveal ${index % 2 === 1 ? 'project-row--reversed' : ''}`}
  >
    <div className="project-row-visual">
      <ProjectThumbnail spec={project.thumbnail} name={project.name} />
    </div>
    <div className="project-row-content">
      <div className="project-row-meta">
        <span className="project-row-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="project-row-type">{project.tag}</span>
      </div>
      <h3 className="project-row-name">{project.name}</h3>
      <p className="project-row-desc">{project.desc}</p>
      <div className="project-row-tech">
        {project.tech.map(t => (
          <span key={t} className="tech-badge">{t}</span>
        ))}
      </div>
      <span className="project-row-cta">
        Read case study
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </span>
    </div>
  </Link>
);

const ProjectsSection: React.FC = () => {
  const featured = PROJECTS_LIST.slice(0, FEATURED_COUNT);

  return (
    <>
      <div className="section-divider"></div>

      <section id="projects">
        <div className="projects-header">
          <div>
            <div className="section-label">
              <span className="num">03</span> Selected Work
            </div>
            <h2>Selected <em>projects</em></h2>
          </div>
          {PROJECTS_LIST.length > FEATURED_COUNT && (
            <Link to="/work" className="writing-archive-link">
              View all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </Link>
          )}
        </div>

        <div className="projects-list">
          {featured.map((p, i) => (
            <ProjectRow key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
};

export default ProjectsSection;
