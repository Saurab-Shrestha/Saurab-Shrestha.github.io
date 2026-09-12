import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors so a single bad route can't blank the whole app.
 * Resets when the user navigates, via the `key` the router gives it.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="page-message" role="alert">
        <p className="page-message-eyebrow">Error</p>
        <h1 className="page-message-title">Something broke.</h1>
        <p className="page-message-body">
          This page failed to render. Reloading usually clears it — if it doesn't,
          I'd genuinely like to know.
        </p>
        <div className="page-message-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <a href={import.meta.env.BASE_URL} className="btn-ghost">
            Go home
          </a>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
