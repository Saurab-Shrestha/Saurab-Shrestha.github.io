import React, { useEffect, useRef, useState } from 'react';

interface Props {
  email: string;
}

type State = 'idle' | 'copied' | 'failed';

const RESET_MS = 2000;

/**
 * One-click email copy.
 *
 * The fastest path for someone who wants to reach out and won't fill in a form.
 * Falls back to a mailto link if the clipboard API is unavailable or blocked —
 * which it is on insecure origins and in some embedded browsers, so this is a
 * real branch, not defensive padding.
 */
const CopyEmail: React.FC<Props> = ({ email }) => {
  const [state, setState] = useState<State>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = window.setTimeout(() => setState('idle'), RESET_MS);
  };

  const label = state === 'copied' ? 'Copied'
    : state === 'failed' ? 'Press ⌘C'
      : 'Copy';

  return (
    <div className="copy-email">
      <button
        type="button"
        className={`copy-email-btn is-${state}`}
        onClick={copy}
        // The address is the button's own text, so the accessible name must say
        // what pressing it does, not repeat the address.
        aria-label={`Copy email address ${email} to clipboard`}
      >
        <span className="copy-email-address">{email}</span>
        <span className="copy-email-action" aria-hidden="true">{label}</span>
      </button>

      {/* Announced on change; the visual label alone would be silent to AT. */}
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Email address copied to clipboard'
          : state === 'failed' ? 'Copy failed — select the address and copy manually'
            : ''}
      </span>
    </div>
  );
};

export default CopyEmail;
