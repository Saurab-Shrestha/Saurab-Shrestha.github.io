import React, { useEffect, useState } from 'react';

const TIME_ZONE = 'Asia/Kathmandu';
const TICK_MS = 30_000;

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** UTC offset as a string, derived rather than hardcoded (Nepal is +05:45). */
function offsetLabel(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    timeZoneName: 'shortOffset',
  }).formatToParts(new Date());
  return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
}

/**
 * Local time where Saurab is, for anyone working out when they'd overlap.
 *
 * Ticks every 30s rather than every second — a seconds display on a portfolio
 * is motion for its own sake, and it would rerender 60x more often for no
 * information gain.
 */
const LocalTime: React.FC = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="local-time">
      <time dateTime={now.toISOString()}>{formatter.format(now)}</time>
      <span className="local-time-zone"> {offsetLabel()}</span>
    </span>
  );
};

export default LocalTime;
