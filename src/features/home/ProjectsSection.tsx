import React from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS_LIST, type ProjectContent } from '../../data/content';
import ProjectThumbnail from '../../components/ProjectThumbnail';

/** Homepage shows the first few; /work shows everything. */
const FEATURED_COUNT = 3;

const ProjectCard: React.FC<{ project: ProjectContent; index: number }> = ({ project, index }) => (
  <Link to={`/work/${project.id}`} className="pcard reveal">
    <div className="pcard-head">
      <span className="pcard-num">{String(index + 1).padStart(2, '0')}</span>
      <span className="pcard-tag">{project.tag}</span>
    </div>

    <h3 className="pcard-name">{project.name}</h3>
    <p className="pcard-desc">{project.desc}</p>

    <div className="pcard-visual">
      <ProjectThumbnail spec={project.thumbnail} name={project.name} />
    </div>

    <div className="pcard-tech">
      {project.tech.slice(0, 4).map(t => (
        <span key={t} className="tech-badge">{t}</span>
      ))}
    </div>

    <span className="pcard-cta">
      View project
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="13 6 19 12 13 18" />
      </svg>
    </span>
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
            <h2>Things I've built<br /><em>(and what they do)</em>.</h2>
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

        <div className="pcards">
          {featured.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
};

export default ProjectsSection;
