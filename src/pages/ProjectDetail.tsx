import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROJECTS_CONTENT, PROJECTS_LIST } from '../data/content';
import BlogLayout from '../components/BlogLayout';
import ProjectThumbnail from '../components/ProjectThumbnail';
import NotFound from './NotFound';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const project = id ? PROJECTS_CONTENT[id] : undefined;

  if (!project) {
    return <NotFound kind="project" backTo="/work" backLabel="Browse all work" />;
  }

  // Wrap around so the last project still offers somewhere to go.
  const pos = PROJECTS_LIST.findIndex(p => p.id === project.id);
  const next = PROJECTS_LIST[(pos + 1) % PROJECTS_LIST.length];
  const hasNext = PROJECTS_LIST.length > 1 && next && next.id !== project.id;

  return (
    <div className="project-detail">

      {/* ── HERO HEADER ── */}
      <div className="detail-head">
        <Link to="/work" className="detail-back">← Back to Work</Link>

        <p className="detail-eyebrow">Case Study</p>
        <h1 className="detail-title">{project.name}</h1>

        <div className="detail-meta">
          {[
            { label: 'Year', value: project.year },
            { label: 'Role', value: project.role },
            { label: 'Stack', value: project.tech.slice(0, 3).join(', ') },
          ].filter(m => m.value).map(({ label, value }) => (
            <div key={label}>
              <div className="detail-meta-label">{label}</div>
              <div className="detail-meta-value">{value}</div>
            </div>
          ))}
          {project.github && (
            <div>
              <div className="detail-meta-label">Source</div>
              <a
                className="detail-meta-value detail-meta-link"
                href={project.github}
                target="_blank"
                rel="noreferrer"
              >
                View repository ↗
              </a>
            </div>
          )}
        </div>

        <div className="detail-rule" />
      </div>

      {/* ── HERO THUMB ── */}
      <div className="detail-hero-visual-wrap">
        <div className="detail-hero-visual">
          <ProjectThumbnail spec={project.thumbnail} name={project.name} />
        </div>
      </div>

      {/* ── ARTICLE BODY + TOC SIDEBAR ── */}
      <BlogLayout content={project.markdown} basePath={`/work/${project.id}`} />

      {/* ── NEXT PROJECT ── */}
      <nav className="detail-next" aria-label="More work">
        <p className="detail-eyebrow">Next project</p>
        {hasNext ? (
          <>
            <Link to={`/work/${next.id}`} className="detail-next-title">
              {next.name} →
            </Link>
            <p className="detail-next-desc">{next.desc}</p>
          </>
        ) : null}
        <Link to="/work" className="btn-ghost detail-next-all">All work</Link>
      </nav>
    </div>
  );
};

export default ProjectDetail;
