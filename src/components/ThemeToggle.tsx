import React, { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const ORDER: Theme[] = ['system', 'light', 'dark'];

const LABEL: Record<Theme, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/** Mirrors the pre-paint script in index.html — keep the two in sync. */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);

  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage — the choice just won't persist.
  }
}

function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch { /* unreadable storage */ }
  return 'system';
}

/**
 * Three-state theme control: System / Light / Dark.
 *
 * Not a sun/moon switch — a two-state toggle can't express "follow the OS",
 * which is the state most people actually want and the one that should be
 * recoverable once they've picked something else.
 */
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('system');

  // Read after mount so the markup matches what the pre-paint script produced.
  useEffect(() => { setTheme(readStored()); }, []);

  const pick = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      {ORDER.map((t) => (
        <button
          key={t}
          type="button"
          className={`theme-toggle-btn ${theme === t ? 'is-active' : ''}`}
          aria-pressed={theme === t}
          onClick={() => pick(t)}
        >
          {LABEL[t]}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
