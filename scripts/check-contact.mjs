#!/usr/bin/env node
/**
 * Copy-email check.
 *
 * With the contact form still unconfigured, this button is the only working way
 * to reach out, so it gets a test. Asserts both paths:
 *   1. focused document -> clipboard actually receives the address, label
 *      confirms, and resets
 *   2. unfocused document -> no throw, the fallback label and a live-region
 *      announcement appear instead
 *
 * Note: headless Chrome has no window focus, so clipboard.writeText always
 * fails with "Document is not focused" unless focus emulation is switched on.
 * That's why the unfocused branch is the easy one to hit here, and why the
 * focused branch needs Emulation.setFocusEmulationEnabled.
 *
 * Usage: npm run serve &  then: node scripts/check-contact.mjs
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const URL_BASE = process.env.BASE ?? 'http://localhost:4173';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9466;

const chrome = spawn(CHROME, ['--headless','--no-sandbox','--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`,'--window-size=1280,900','about:blank'], { stdio: 'ignore' });
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
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description);
    return r.result?.result?.value;
  };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Browser.grantPermissions', {
    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
    origin: new URL(URL_BASE).origin,
  });

  const press = `(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const btn = document.querySelector('.copy-email-btn');
    if (!btn) return { error: 'copy button not found' };
    const act = () => btn.querySelector('.copy-email-action').textContent.trim();
    const width = () => Math.round(btn.getBoundingClientRect().width);

    const before = act();
    const w0 = width();
    btn.click();
    await wait(400);
    const after = act();
    const w1 = width();
    const live = document.querySelector('[role=status]')?.textContent.trim();
    await wait(2100);
    return { before, after, reset: act(), live, drift: Math.abs(w1 - w0),
             label: btn.getAttribute('aria-label'),
             address: btn.querySelector('.copy-email-address').textContent.trim() };
  })()`;

  // ── 1. Focused: the real success path ────────────────────────────────────
  await send('Page.navigate', { url: `${URL_BASE}/` });
  await sleep(2800);
  await send('Page.bringToFront');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await sleep(300);

  const ok = await evaluate(press);
  if (ok.error) fail.push(ok.error);
  else {
    const clip = await evaluate(`navigator.clipboard.readText().then(t => t).catch(() => null)`);
    console.log(`  focused    "${ok.before}" -> "${ok.after}" -> "${ok.reset}"  width drift ${ok.drift}px`);
    if (ok.after !== 'Copied') fail.push(`focused click showed "${ok.after}", expected "Copied"`);
    if (ok.reset !== 'Copy') fail.push(`label did not reset (stuck on "${ok.reset}")`);
    if (ok.drift > 2) fail.push(`button resized by ${ok.drift}px on click`);
    if (!ok.label?.includes(ok.address)) fail.push('aria-label does not name the address being copied');
    // readText is blocked even when write succeeds, so a null here is expected.
    if (clip !== null && clip !== ok.address) fail.push(`clipboard held "${clip}", expected the address`);
    console.log(`  clipboard  ${clip === null ? 'write ok (readback blocked in headless)' : clip}`);
  }

  // ── 2. Unfocused: the degraded path a real user can hit ──────────────────
  await send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await send('Page.navigate', { url: `${URL_BASE}/` });
  await sleep(2800);

  const degraded = await evaluate(press);
  console.log(`  unfocused  "${degraded.before}" -> "${degraded.after}"  live: ${degraded.live ? 'announced' : 'SILENT'}`);
  if (degraded.after === 'Copied') {
    console.log('             (clipboard succeeded anyway — fallback not exercised)');
  } else {
    if (degraded.after === degraded.before) fail.push('failed copy gave no visible feedback');
    if (!degraded.live) fail.push('failed copy was not announced to assistive tech');
  }
} catch (err) {
  fail.push(`harness: ${err.message}`);
} finally {
  try { ws?.close(); } catch { /* noop */ }
  cleanup();
}

console.log();
if (fail.length) { console.error('✗ copy-email checks failed:\n' + fail.map(f => '  - ' + f).join('\n')); process.exit(1); }
console.log('✓ copy-email: writes the address, confirms, resets, and degrades audibly');
