#!/usr/bin/env node
/**
 * Evidence Graph checks.
 *
 * The three.js bundle is ~128KB gzip, and a WebGL context leaked per route
 * change is the classic way a component like this quietly degrades a SPA.
 * So this asserts:
 *   1. no 3D chunk is requested on the homepage or any other project
 *   2. it is requested on /work/neuralnoodle, and a canvas actually renders
 *   3. prefers-reduced-motion gets the static SVG and loads no 3D at all
 *   4. navigating in and out ten times does not accumulate WebGL contexts
 *   5. with WebGL unavailable it still renders, using the static SVG
 *
 * Usage: npm run serve &  then: node scripts/check-graph.mjs
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const URL_BASE = process.env.BASE ?? 'http://localhost:4173/SaurabShrestha';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9388;
const CHUNK = /GraphScene|three/i;

// --disable-gpu turns WebGL off entirely, which would make every run take the
// fallback path and prove nothing about the 3D one. SwiftShader gives headless a
// real software WebGL context.
const chrome = spawn(CHROME, ['--headless','--no-sandbox','--enable-unsafe-swiftshader',
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

  let msgId = 0;
  const pending = new Map();
  let requested = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Network.requestWillBeSent') requested.push(m.params.request.url);
  };
  const send = (method, params = {}) => new Promise(r => { const id = ++msgId; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description);
    return r.result?.result?.value;
  };

  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');

  const visit = async (route, settle = 3000) => {
    requested = [];
    await send('Page.navigate', { url: `${URL_BASE}/${route}` });
    await sleep(settle);
    return requested.filter(u => CHUNK.test(u));
  };

  // ── 1. Not on pages that shouldn't have it ───────────────────────────────
  for (const route of ['', 'work', 'work/tdd', 'blog']) {
    const hits = await visit(route, 2500);
    const label = `/${route || '(home)'}`.padEnd(22);
    console.log(`  ${label} 3D requests: ${hits.length}`);
    if (hits.length) fail.push(`3D chunk loaded on /${route || '(home)'} — it should be scoped to neuralnoodle`);
  }

  // ── 2. Present and rendering where it should be ──────────────────────────
  const hits = await visit('work/neuralnoodle', 4500);
  console.log(`  /work/neuralnoodle     3D requests: ${hits.length}`);
  if (!hits.length) fail.push('3D chunk was never requested on /work/neuralnoodle');

  const rendered = await evaluate(`(() => {
    const c = document.querySelector('.eg-canvas canvas');
    return {
      mounted: !!document.querySelector('.eg'),
      canvas: !!c,
      w: c ? c.width : 0,
      h: c ? c.height : 0,
      caption: !!document.querySelector('.eg-caption'),
      evidenceItems: document.querySelectorAll('.eg-columns li').length,
    };
  })()`);
  console.log(`  mounted=${rendered.mounted} canvas=${rendered.canvas} ${rendered.w}x${rendered.h}, caption=${rendered.caption}, evidence listed=${rendered.evidenceItems}`);
  if (!rendered.mounted) fail.push('EvidenceGraph did not mount at all');
  if (!rendered.canvas) fail.push('no canvas rendered on the case study');
  if (!rendered.caption) fail.push('accessible caption missing');
  if (!rendered.evidenceItems) fail.push('evidence list is empty — the argument is only in the canvas');

  // ── 3. Reduced motion gets the SVG and loads nothing ─────────────────────
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const reducedHits = await visit('work/neuralnoodle', 3500);
  const reduced = await evaluate(`({
    canvas: !!document.querySelector('.eg-canvas canvas'),
    svg: !!document.querySelector('.eg-fallback svg'),
    hidden: document.querySelector('.eg-fallback')?.getAttribute('data-hidden'),
  })`);
  console.log(`  reduced-motion         3D requests: ${reducedHits.length}, svg=${reduced.svg}, canvas=${reduced.canvas}`);
  if (reducedHits.length) fail.push('reduced motion still downloaded the 3D bundle');
  if (!reduced.svg) fail.push('reduced motion has no static fallback');
  if (reduced.canvas) fail.push('reduced motion still built a WebGL canvas');
  await send('Emulation.setEmulatedMedia', { features: [] });

  // ── 4. No context accumulation across navigation ─────────────────────────
  await send('Page.navigate', { url: `${URL_BASE}/work/neuralnoodle` });
  await sleep(3500);
  const churn = await evaluate(`(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const canvases = () => document.querySelectorAll('canvas').length;
    const nav = (sel) => { const a = [...document.querySelectorAll('a')].find(a => a.getAttribute('href')?.endsWith(sel)); a?.click(); };
    const before = canvases();
    for (let i = 0; i < 10; i++) {
      nav('/work'); await wait(220);
      nav('/work/neuralnoodle'); await wait(320);
    }
    await wait(1500);
    return { before, after: canvases() };
  })()`);
  console.log(`  after 10 round-trips   canvases: ${churn.before} -> ${churn.after}`);
  if (churn.after > churn.before + 1) {
    fail.push(`WebGL canvases accumulated across navigation: ${churn.before} -> ${churn.after}`);
  }
  // ── 5. No WebGL at all still renders ─────────────────────────────────────
  // Blocking the context is the closest headless equivalent of a machine where
  // WebGL is unavailable or disabled by policy.
  // Must be installed before the document runs, or the navigation in visit()
  // wipes it and WebGL is available again.
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      const proto = HTMLCanvasElement.prototype;
      const orig = proto.getContext;
      proto.getContext = function (type, ...rest) {
        if (String(type).startsWith('webgl')) return null;
        return orig.call(this, type, ...rest);
      };
    })()`,
  });
  const noGlHits = await visit('work/neuralnoodle', 3500);
  const noGl = await evaluate(`({
    svg: !!document.querySelector('.eg-fallback svg'),
    canvas: !!document.querySelector('.eg-canvas canvas'),
    caption: !!document.querySelector('.eg-caption'),
  })`);
  console.log(`  no-webgl               3D requests: ${noGlHits.length}, svg=${noGl.svg}, caption=${noGl.caption}`);
  if (!noGl.svg) fail.push('no-WebGL path lost the static fallback');
  if (!noGl.caption) fail.push('no-WebGL path lost the caption');
  if (noGlHits.length) fail.push('no-WebGL path still downloaded the 3D bundle');
} catch (err) {
  fail.push(`harness: ${err.message}`);
} finally {
  try { ws?.close(); } catch { /* noop */ }
  cleanup();
}

console.log();
if (fail.length) { console.error('✗ evidence graph checks failed:\n' + fail.map(f => '  - ' + f).join('\n')); process.exit(1); }
console.log('✓ 3D is scoped to one route, degrades to SVG, and leaks no contexts');
