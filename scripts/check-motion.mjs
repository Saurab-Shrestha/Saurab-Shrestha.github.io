#!/usr/bin/env node
/**
 * Motion behaviour check, driven over the Chrome DevTools Protocol.
 *
 * Asserts what the Phase 2 rebuild changed, all of which a build can silently
 * regress:
 *   1. a revealed element stays revealed after you scroll past and come back
 *      (elements used to re-run their entrance every single time)
 *   2. the nav scrollspy marks the section you are actually in
 *   3. under prefers-reduced-motion nothing is left stuck at opacity 0
 *   4. cumulative layout shift stays under the 0.1 "good" threshold
 *
 * Usage: npm run serve &  then: node scripts/check-motion.mjs
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const URL_BASE = process.env.BASE ?? 'http://localhost:4173/SaurabShrestha';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

const chrome = spawn(CHROME, [
  '--headless', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--window-size=1440,900',
  'about:blank',
], { stdio: 'ignore' });

const cleanup = () => { try { chrome.kill(); } catch { /* already gone */ } };
process.on('exit', cleanup);

let ws;
const fail = [];

try {
  // Wait for the debugging endpoint.
  let target;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      target = list.find(t => t.type === 'page');
      if (target?.webSocketDebuggerUrl) break;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  if (!target) throw new Error('Chrome DevTools endpoint never came up');

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise((res) => {
    const id = ++msgId;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  // Installed before the document runs so buffered entries are captured.
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__cls = 0; window.__clsSources = [];
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          if (e.hadRecentInput) continue;
          window.__cls += e.value;
          for (const s of (e.sources || [])) {
            if (s.node) window.__clsSources.push(s.node.tagName.toLowerCase() + '.' + ((typeof s.node.className === 'string' && s.node.className.split(' ')[0]) || '-'));
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    `,
  });

  await send('Page.navigate', { url: `${URL_BASE}/` });
  await sleep(3500);

  // ── 1. Reveals are one-way ────────────────────────────────────────────────
  const revealResult = await evaluate(`(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const els = [...document.querySelectorAll('.reveal, .reveal-left')];
    if (els.length === 0) return { error: 'no .reveal elements found' };

    // Scroll to the bottom so everything has had a chance to reveal.
    window.scrollTo(0, document.body.scrollHeight);
    await wait(2500);
    const revealedAtBottom = els.filter(e => e.classList.contains('visible')).length;

    // Back to the top, past everything we just revealed.
    window.scrollTo(0, 0);
    await wait(1200);
    const stillRevealed = els.filter(e => e.classList.contains('visible')).length;
    const hasExitClass = els.some(e => e.classList.contains('exit'));

    return { total: els.length, revealedAtBottom, stillRevealed, hasExitClass };
  })()`);

  if (revealResult?.error) {
    fail.push(`reveal: ${revealResult.error}`);
  } else {
    const { total, revealedAtBottom, stillRevealed, hasExitClass } = revealResult;
    console.log(`  reveal   ${revealedAtBottom}/${total} revealed at bottom, ${stillRevealed} still revealed after scrolling back`);
    if (revealedAtBottom === 0) fail.push('reveal: nothing ever revealed');
    if (stillRevealed < revealedAtBottom) {
      fail.push(`reveal: ${revealedAtBottom - stillRevealed} element(s) un-revealed on scroll back — entrance is replaying`);
    }
    if (hasExitClass) fail.push('reveal: .exit class is back');
  }

  // ── 2. Scrollspy marks the current section ────────────────────────────────
  const spyResult = await evaluate(`(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = {};
    for (const id of ['about', 'timeline', 'contact']) {
      const el = document.getElementById(id);
      if (!el) { out[id] = 'missing-section'; continue; }
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 40);
      await wait(900);
      const current = document.querySelector('.nav-links a.is-current');
      out[id] = current ? current.getAttribute('href') : 'none';
    }
    return out;
  })()`);

  // ── 4. Layout stability ───────────────────────────────────────────────────
  // The home route once scored 0.32 because it was lazily loaded: the short
  // Suspense fallback was swapped for the full page and shoved the footer down.
  const vitals = await evaluate(`({ cls: +window.__cls.toFixed(4), sources: [...new Set(window.__clsSources)].slice(0, 4) })`);
  console.log(`  cls      ${vitals.cls}${vitals.sources.length ? '  from ' + vitals.sources.join(', ') : ''}`);
  if (vitals.cls > 0.1) fail.push(`layout shift ${vitals.cls} exceeds the 0.1 threshold (${vitals.sources.join(', ')})`);

  // ── 3. Reduced motion leaves nothing invisible ────────────────────────────
  // .reveal starts at opacity 0; if the reduced-motion override ever stops
  // applying, the entire page renders blank for those users.
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await send('Page.navigate', { url: `${URL_BASE}/` });
  await sleep(2500);

  const reducedResult = await evaluate(`(() => {
    const els = [...document.querySelectorAll('.reveal, .reveal-left')];
    const invisible = els.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99);
    const hero = [...document.querySelectorAll('.hero-left > *, .hero-right')];
    const heroInvisible = hero.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99);
    return { total: els.length, invisible: invisible.length, heroTotal: hero.length, heroInvisible: heroInvisible.length };
  })()`);

  console.log(`  reduced  ${reducedResult.invisible}/${reducedResult.total} reveal + ${reducedResult.heroInvisible}/${reducedResult.heroTotal} hero elements invisible`);
  if (reducedResult.invisible > 0) fail.push(`reduced motion: ${reducedResult.invisible} .reveal element(s) stuck below full opacity`);
  if (reducedResult.heroInvisible > 0) fail.push(`reduced motion: ${reducedResult.heroInvisible} hero element(s) stuck below full opacity`);

  await send('Emulation.setEmulatedMedia', { features: [] });

  for (const [id, got] of Object.entries(spyResult ?? {})) {
    const ok = got === `#${id}`;
    console.log(`  scrollspy in #${id.padEnd(9)} nav marks ${got}`);
    if (!ok) fail.push(`scrollspy: inside #${id} the nav marked "${got}"`);
  }
} catch (err) {
  fail.push(`harness: ${err.message}`);
} finally {
  try { ws?.close(); } catch { /* noop */ }
  cleanup();
}

console.log();
if (fail.length) {
  console.error('✗ motion checks failed:\n' + fail.map(f => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log('✓ reveals fire once, scrollspy tracks, reduced motion shows all, layout stable');
