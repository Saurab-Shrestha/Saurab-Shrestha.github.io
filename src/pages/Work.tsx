import React from 'react';
import { Link } from 'react-router-dom';
import { useRouteContentReady } from '../lib/routeReady';
import { PROJECTS_LIST, type ProjectContent } from '../data/content';
import ProjectThumbnail from '../components/ProjectThumbnail';

const WorkItem: React.FC<{ project: ProjectContent; index: number }> = ({ project, index }) => (
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
        {project.tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
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

const Work: React.FC = () => {
  useRouteContentReady();

  return (
    <section id="projects" className="work-page">
      <div className="projects-header" style={{ marginBottom: '72px' }}>
        <div>
          <div className="section-label"><span className="num">03</span> Selected Work</div>
          <h1>Selected <em>technical work</em></h1>
          <p className="writing-intro">
            Solving complex problems at the intersection of web architecture and machine learning.
          </p>
        </div>
      </div>

      <div className="projects-list">
        {PROJECTS_LIST.map((p, i) => (
          <WorkItem key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
};

export default Work;
