import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundProps {
  /** What was looked for, e.g. "project" or "post". Defaults to "page". */
  kind?: string;
  /** Where "browse all" should go. Defaults to home. */
  backTo?: string;
  backLabel?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  kind = 'page',
  backTo = '/',
  backLabel = 'Go home',
}) => (
  <section className="page-message">
    <p className="page-message-eyebrow">404</p>
    <h1 className="page-message-title">
      No such {kind}.
    </h1>
    <p className="page-message-body">
      The link may be out of date, or I may have moved something. Nothing you did.
    </p>
    <div className="page-message-actions">
      <Link to={backTo} className="btn-primary">{backLabel}</Link>
      <Link to="/work" className="btn-ghost">See the work</Link>
    </div>
  </section>
);

export default NotFound;
