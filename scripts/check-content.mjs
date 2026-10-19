#!/usr/bin/env node
/**
 * Content integrity check.
 *
 * The bug this exists to catch: the homepage linked to /work/svufe, no such
 * project existed, and ProjectDetail fell back to a key that didn't exist
 * either — so the third project card white-screened the whole app.
 *
 * Run: node scripts/check-content.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fail = [];
const check = (cond, msg) => { if (!cond) fail.push(msg); };

// Mirrors PROJECT_ORDER in src/data/content.ts.
const ORDER = ['pramana', 'hdes', 'tdd', 'svufe'];
// Mirrors the SVGS map in src/components/ProjectThumbnail.tsx.
const SVG_KEYS = ['pramana', 'svufe'];

const frontmatter = (raw) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: m[2] };
};

// ── Projects ────────────────────────────────────────────────────────────────
const projDir = join(root, 'src/data/projects');
const projFiles = readdirSync(projDir).filter(f => f.endsWith('.md'));
const projIds = projFiles.map(f => f.replace(/\.md$/, ''));

for (const id of ORDER) {
  check(projIds.includes(id), `PROJECT_ORDER lists "${id}" but src/data/projects/${id}.md is missing`);
}

for (const file of projFiles) {
  const id = file.replace(/\.md$/, '');
  const parsed = frontmatter(readFileSync(join(projDir, file), 'utf8'));
  check(parsed, `${file}: no frontmatter block`);
  if (!parsed) continue;

  const { meta } = parsed;
  for (const key of ['name', 'tag', 'year', 'role', 'desc', 'tech', 'thumbnail']) {
    check(meta[key], `${file}: missing frontmatter "${key}"`);
  }
  check(meta.tech?.startsWith('['), `${file}: "tech" must be an inline list, got ${meta.tech}`);

  // Every thumbnail spec must resolve to something that exists.
  const [kind, value] = (meta.thumbnail ?? '').split(':');
  if (kind === 'svg') {
    check(SVG_KEYS.includes(value), `${file}: thumbnail "svg:${value}" has no component in ProjectThumbnail.tsx`);
  } else if (kind === 'img') {
    check(existsSync(join(root, 'public', value)), `${file}: thumbnail image public/${value} does not exist`);
  } else {
    fail.push(`${file}: thumbnail must be "svg:<key>" or "img:<path>", got "${meta.thumbnail}"`);
  }

  check(!projIds.includes(id) || parsed.body.trim().length > 200, `${file}: case study body is suspiciously short`);
}

// ── Blog posts ──────────────────────────────────────────────────────────────
const blogDir = join(root, 'src/data/blog');
for (const slug of readdirSync(blogDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)) {
  const mds = readdirSync(join(blogDir, slug)).filter(f => f.endsWith('.md'));
  check(mds.length === 1, `blog/${slug}: expected exactly 1 .md, found ${mds.length}`);
  if (!mds.length) continue;

  const parsed = frontmatter(readFileSync(join(blogDir, slug, mds[0]), 'utf8'));
  check(parsed, `blog/${slug}: no frontmatter block`);
  if (!parsed) continue;

  for (const key of ['title', 'date', 'tag', 'readTime', 'excerpt']) {
    check(parsed.meta[key], `blog/${slug}: missing frontmatter "${key}"`);
  }
  // An unparseable date sorts the post to the end and blanks its <time> element.
  check(
    !Number.isNaN(Date.parse(parsed.meta.date ?? '')),
    `blog/${slug}: date "${parsed.meta.date}" is not parseable`
  );
}

// ── Report ──────────────────────────────────────────────────────────────────
if (fail.length) {
  console.error(`✗ ${fail.length} content problem(s):\n` + fail.map(f => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log(`✓ ${projIds.length} projects, all link targets and thumbnails resolve`);
