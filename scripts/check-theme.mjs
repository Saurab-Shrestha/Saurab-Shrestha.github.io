#!/usr/bin/env node
/**
 * Dark-mode check.
 *
 * Renders every route under both prefers-color-scheme values and asserts:
 *   1. surfaces follow the theme (no hardcoded panel stuck light or dark)
 *   2. every text node meets 4.5:1 against what is actually painted behind it
 *   3. the pre-paint script prevents a light flash for a stored dark preference
 *
 * Usage: npm run serve &  then: node scripts/check-theme.mjs
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const URL_BASE = process.env.BASE ?? 'http://localhost:4173';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9355;
const ROUTES = ['', 'work', 'blog', 'work/pranama', 'blog/understanding-transformer'];

const chrome = spawn(CHROME, ['--headless','--disable-gpu','--no-sandbox',
  `--remote-debugging-port=${PORT}`,'--window-size=1440,900','about:blank'], { stdio: 'ignore' });
const cleanup = () => { try { chrome.kill(); } catch { /* gone */ } };
process.on('exit', cleanup);

const fail = [];
let ws;
try {
  let target;
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find(t => t.type === 'page');
      if (target?.webSocketDebuggerUrl) break;
    } catch { /* not up */ }
    await sleep(250);
  }
  if (!target) throw new Error('DevTools endpoint never came up');

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let msgId = 0; const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const id = ++msgId; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    const ex = r.result?.exceptionDetails;
    if (ex) throw new Error(ex.exception?.description ?? ex.text);
    return r.result?.result?.value;
  };

  await send('Page.enable'); await send('Runtime.enable');

  // Chrome returns computed colours in the space they were authored in — these
  // tokens compute to oklch(...), so reading "r, g, b" out with a regex yields
  // nonsense (and scored every pair at 1.00). Rasterise through a 1x1 canvas,
  // which normalises anything the browser can parse.
  const CONTRAST_FN = `
    const _cv = document.createElement('canvas'); _cv.width = _cv.height = 1;
    const _cx = _cv.getContext('2d', { willReadFrequently: true });
    const parse = c => {
      _cx.clearRect(0, 0, 1, 1);
      _cx.fillStyle = '#000';
      _cx.fillStyle = c;
      _cx.fillRect(0, 0, 1, 1);
      const d = _cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const srgb = v => v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    const lum = ([r,g,b]) => 0.2126*srgb(r/255) + 0.7152*srgb(g/255) + 0.0722*srgb(b/255);
    const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)]; const hi=Math.max(x,y), lo=Math.min(x,y); return (hi+0.05)/(lo+0.05); };
    const isTransparent = c => !c || c === 'transparent' || parse(c)[3] < 0.1;
    const bgOf = el => { let n = el; while (n && n !== document.documentElement) {
        const c = getComputedStyle(n).backgroundColor;
        if (!isTransparent(c)) return parse(c);
        n = n.parentElement; }
      return parse(getComputedStyle(document.body).backgroundColor); };
  `;

  for (const scheme of ['light', 'dark']) {
  console.log(`  -- ${scheme} --`);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
  for (const route of ROUTES) {
    await send('Page.navigate', { url: `${URL_BASE}/${route}` });
    await sleep(2600);

    const r = await evaluate(`(() => {
      ${CONTRAST_FN}
      const bodyBg = parse(getComputedStyle(document.body).backgroundColor);
      const bodyLum = lum(bodyBg);

      // Surfaces that did not follow the theme: a light panel on a dark page
      // (or the reverse) means a hardcoded colour somewhere.
      const wantDark = bodyLum < 0.2;
      const lightSurfaces = [...document.querySelectorAll('*')].filter(el => {
        const c = getComputedStyle(el).backgroundColor;
        if (isTransparent(c)) return false;
        // The skip link is a deliberately inverted chip, parked off-screen.
        if (el.classList.contains('skip-link')) return false;
        if (el.closest('.code-block, pre')) return false;   // code stays dark in both
        const l = lum(parse(c));
        return (wantDark ? l > 0.55 : l < 0.12) && el.getBoundingClientRect().width > 40;
      }).map(el => el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?el.className.split(' ')[0]:'')).slice(0,5);

      // Text contrast.
      const bad = [];
      for (const el of document.querySelectorAll('p,a,h1,h2,h3,h4,span,li,td,th,button,time')) {
        if (!el.textContent.trim()) continue;
        if (el.children.length && !([...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim()))) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        if (parseFloat(cs.opacity) < 0.6) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4) continue;
        if (rect.bottom < 0 || rect.top > window.innerHeight * 8) continue;  // off-screen (skip link)
        if (el.closest('.code-block, pre')) continue;  // code keeps its own dark theme in both modes
        const size = parseFloat(cs.fontSize);
        const bold = parseInt(cs.fontWeight,10) >= 700;
        const large = size >= 24 || (size >= 18.66 && bold);
        const need = large ? 3 : 4.5;
        const cr = ratio(parse(cs.color), bgOf(el));
        if (cr < need) bad.push(el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?el.className.split(' ')[0]:'-')+' '+cr.toFixed(2)+'<'+need);
      }
      return { wantDark, bodyLum, lightSurfaces, bad: [...new Set(bad)].slice(0,6), badCount: bad.length };
    })()`);

    const label = `  /${route || '(home)'}`.padEnd(36);
    if (r.wantDark !== (scheme === 'dark')) {
      fail.push(`${scheme} ${label.trim()} body did not follow the scheme`);
      console.log(`${label} ✗ wrong scheme`); continue;
    }
    if (r.lightSurfaces.length) fail.push(`${scheme} ${label.trim()} off-theme surfaces: ${r.lightSurfaces.join(', ')}`);
    if (r.badCount) fail.push(`${scheme} ${label.trim()} ${r.badCount} low-contrast: ${r.bad.join(', ')}`);
    console.log(`${label} ${r.badCount === 0 && !r.lightSurfaces.length ? 'ok' : '✗ ' + [r.lightSurfaces.join(','), r.bad.join(', ')].filter(Boolean).join(' | ')}`);
  }
  }

  // Flash check: set a stored preference, reload, read the attribute at first paint.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await evaluate(`localStorage.setItem('theme','dark')`);
  await send('Page.navigate', { url: `${URL_BASE}/` });
  await sleep(1800);
  const flash = await evaluate(`document.documentElement.getAttribute('data-theme')`);
  console.log(`  stored dark + OS light      -> data-theme=${flash}`);
  if (flash !== 'dark') fail.push('pre-paint script did not apply the stored theme');
  await evaluate(`localStorage.removeItem('theme')`);
} catch (err) {
  fail.push(`harness: ${err.message}`);
} finally {
  try { ws?.close(); } catch { /* noop */ }
  cleanup();
}

console.log();
if (fail.length) { console.error('✗ theme checks failed:\n' + fail.map(f => '  - ' + f).join('\n')); process.exit(1); }
console.log('✓ both themes: surfaces follow, text meets 4.5:1, no light flash');
