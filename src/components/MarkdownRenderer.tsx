import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { loadKatex, hasMath } from '../lib/katex';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MarkdownRendererProps {
  content: string;
  headings?: Array<{ id: string; text: string; level: 2 | 3 | 4 }>;
  basePath?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Syntax highlighting — Python + generic fallback
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_COLORS = {
  keyword: '#c792ea',
  builtin: '#82aaff',
  decorator: '#f78c6c',
  string: '#c3e88d',
  comment: '#546e7a',
  number: '#f78c6c',
  operator: '#89ddff',
  classname: '#ffcb6b',
  funcname: '#82aaff',
  self: '#f07178',
  plain: '#d6deeb',
} as const;

type TokenType = keyof typeof TOKEN_COLORS;
interface Token { type: TokenType; value: string }

const PY_KEYWORDS = new Set([
  'def', 'class', 'return', 'import', 'from', 'as', 'if', 'elif', 'else',
  'for', 'while', 'in', 'not', 'and', 'or', 'is', 'with', 'pass', 'raise',
  'try', 'except', 'finally', 'yield', 'lambda', 'global', 'nonlocal', 'assert', 'del', 'async', 'await',
]);
const PY_BUILTINS = new Set([
  'print', 'len', 'range', 'super', 'True', 'False', 'None', 'type', 'isinstance',
  'enumerate', 'zip', 'map', 'filter', 'list', 'dict', 'set', 'tuple', 'int', 'float',
  'str', 'bool', 'torch', 'nn', 'math', 'F', 'np', 'open', 'input', 'abs', 'max', 'min',
  'sum', 'sorted', 'reversed', 'any', 'all', 'hasattr', 'getattr', 'setattr',
]);

function tokenisePython(code: string): Token[][] {
  return code.split('\n').map(line => {
    const tokens: Token[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '#') { tokens.push({ type: 'comment', value: line.slice(i) }); break; }

      // Triple-quoted strings
      if (line.slice(i, i + 3) === '"""' || line.slice(i, i + 3) === "'''") {
        const q = line.slice(i, i + 3);
        const end = line.indexOf(q, i + 3);
        const val = end === -1 ? line.slice(i) : line.slice(i, end + 3);
        tokens.push({ type: 'string', value: val });
        i += val.length; continue;
      }

      // Strings
      if (line[i] === '"' || line[i] === "'") {
        const q = line[i]; let j = i + 1;
        while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; }
        tokens.push({ type: 'string', value: line.slice(i, j + 1) });
        i = j + 1; continue;
      }

      // Decorator
      if (line[i] === '@') {
        let j = i + 1;
        while (j < line.length && /[\w.]/.test(line[j])) j++;
        tokens.push({ type: 'decorator', value: line.slice(i, j) });
        i = j; continue;
      }

      // f-string prefix
      if ((line[i] === 'f' || line[i] === 'F') && (line[i + 1] === '"' || line[i + 1] === "'")) {
        const q = line[i + 1]; let j = i + 2;
        while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; }
        tokens.push({ type: 'string', value: line.slice(i, j + 1) });
        i = j + 1; continue;
      }

      // Number
      if (/[0-9]/.test(line[i])) {
        let j = i + 1;
        while (j < line.length && /[0-9._eExXboBO]/.test(line[j])) j++;
        tokens.push({ type: 'number', value: line.slice(i, j) });
        i = j; continue;
      }

      // Word
      if (/[a-zA-Z_]/.test(line[i])) {
        let j = i + 1;
        while (j < line.length && /[\w]/.test(line[j])) j++;
        const word = line.slice(i, j);
        const prev = tokens.map(t => t.value.trim()).filter(Boolean).at(-1);
        let type: TokenType = 'plain';
        if (word === 'self' || word === 'cls') type = 'self';
        else if (PY_KEYWORDS.has(word)) type = 'keyword';
        else if (PY_BUILTINS.has(word)) type = 'builtin';
        else if (prev === 'def') type = 'funcname';
        else if (prev === 'class') type = 'classname';
        tokens.push({ type, value: word });
        i = j; continue;
      }

      if (/[=+\-*/<>!&|^~%,.:;()[\]{}]/.test(line[i])) {
        tokens.push({ type: 'operator', value: line[i] });
        i++; continue;
      }

      let j = i + 1;
      while (j < line.length && line[j] === ' ') j++;
      tokens.push({ type: 'plain', value: line.slice(i, j) });
      i = j;
    }
    return tokens;
  });
}

// Generic highlighter: strings + comments only
function tokeniseGeneric(code: string, lang: string): Token[][] {
  const commentChar = ['bash', 'sh', 'python', 'py', 'ruby', 'yml', 'yaml'].includes(lang) ? '#'
    : ['css', 'less', 'scss'].includes(lang) ? null
      : '//';
  return code.split('\n').map(line => {
    const tokens: Token[] = [];
    // Full-line comment
    if (commentChar && line.trimStart().startsWith(commentChar)) {
      return [{ type: 'comment', value: line }];
    }
    // Simple: split on strings
    const parts = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g);
    for (const part of parts) {
      if ((part.startsWith('"') || part.startsWith("'") || part.startsWith('`')) && part.length >= 2) {
        tokens.push({ type: 'string', value: part });
      } else {
        // Check for inline comment
        if (commentChar) {
          const ci = part.indexOf(commentChar);
          if (ci !== -1) {
            tokens.push({ type: 'plain', value: part.slice(0, ci) });
            tokens.push({ type: 'comment', value: part.slice(ci) });
            continue;
          }
        }
        tokens.push({ type: 'plain', value: part });
      }
    }
    return tokens;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CodeBlock
// ─────────────────────────────────────────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
  python: 'Python', py: 'Python', typescript: 'TypeScript', ts: 'TypeScript',
  javascript: 'JavaScript', js: 'JavaScript', jsx: 'JSX', tsx: 'TSX',
  bash: 'Bash', sh: 'Shell', json: 'JSON', css: 'CSS', html: 'HTML',
  sql: 'SQL', rust: 'Rust', go: 'Go', java: 'Java', cpp: 'C++', c: 'C',
  yaml: 'YAML', yml: 'YAML', toml: 'TOML', md: 'Markdown', '': 'Code',
};

const CodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);
  const [showLines, setShowLines] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const label = LANG_LABELS[lang.toLowerCase()] ?? lang.toUpperCase() ?? 'Code';
  const isPython = lang === 'python' || lang === 'py';
  const lines = code.trimEnd().split('\n');

  const tokenisedLines = useMemo(() => {
    if (isPython) return tokenisePython(code.trimEnd());
    return tokeniseGeneric(code.trimEnd(), lang.toLowerCase());
  }, [code, lang, isPython]);

  return (
    // Deliberately dark in both themes — a terminal reads as a terminal. The
    // class marks it so theme checks don't flag it as an off-theme surface.
    <div className="code-block" style={{
      marginBottom: '36px',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid #1e2d3d',
      boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0d1b2a',
        borderBottom: '1px solid #1e2d3d',
        padding: '8px 14px',
      }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <span style={{
            marginLeft: '10px',
            fontFamily: 'DM Mono, monospace',
            fontSize: '10px',
            color: '#7fa3d4',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {label}
          </span>
          {lines.length > 3 && (
            <span style={{
              marginLeft: '8px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '10px',
              color: '#6b8fc4',
            }}>
              {lines.length} lines
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* Line numbers toggle */}
          <button
            onClick={() => setShowLines(v => !v)}
            title="Toggle line numbers"
            style={{
              background: showLines ? 'rgba(130,170,255,0.1)' : 'transparent',
              border: `1px solid ${showLines ? '#82aaff44' : '#1e2d3d'}`,
              borderRadius: '4px',
              padding: '3px 8px',
              cursor: 'pointer',
              color: showLines ? '#82aaff' : '#6b8fc4',
              fontFamily: 'DM Mono, monospace',
              fontSize: '10px',
              transition: 'background 220ms cubic-bezier(0.4,0,0.2,1), border-color 220ms cubic-bezier(0.4,0,0.2,1), color 220ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            #
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: copied ? 'rgba(130,170,255,0.15)' : 'transparent',
              border: `1px solid ${copied ? '#82aaff' : '#1e2d3d'}`,
              borderRadius: '5px',
              padding: '3px 10px',
              cursor: 'pointer',
              color: copied ? '#82aaff' : '#7fa3d4',
              fontFamily: 'DM Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.05em',
              transition: 'background 220ms cubic-bezier(0.4,0,0.2,1), border-color 220ms cubic-bezier(0.4,0,0.2,1), color 220ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {copied ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <pre style={{
        background: '#0a1628',
        margin: 0,
        padding: '16px 0',
        overflowX: 'auto',
        fontSize: '13px',
        lineHeight: '1.75',
        fontFamily: 'DM Mono, monospace',
      }}>
        <code style={{ display: 'block' }}>
          {lines.map((_line, li) => (
            <div
              key={li}
              style={{
                display: 'flex',
                paddingLeft: 0,
                minHeight: '1.75em',
              }}
            >
              {/* Line number gutter */}
              {showLines && (
                <span style={{
                  userSelect: 'none',
                  minWidth: '40px',
                  paddingRight: '16px',
                  paddingLeft: '16px',
                  textAlign: 'right',
                  color: '#6b8fc4',
                  fontSize: '11px',
                  borderRight: '1px solid #1e2d3d',
                  marginRight: '16px',
                  flexShrink: 0,
                }}>
                  {li + 1}
                </span>
              )}

              {/* Code content */}
              <span style={{ paddingLeft: showLines ? '0' : '16px', flex: 1 }}>
                {tokenisedLines[li]?.map((tok, ti) => (
                  <span key={ti} style={{ color: TOKEN_COLORS[tok.type] }}>
                    {tok.value}
                  </span>
                )) ?? <span style={{ color: TOKEN_COLORS.plain }}>{' '}</span>}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline processing — bold, italic, code, links, strikethrough, images
// ─────────────────────────────────────────────────────────────────────────────

function processInline(text: string, ctxKey: string, basePath?: string): React.ReactNode[] {
  type Seg = string | React.ReactElement;
  let parts: Seg[] = [text];

  // Math Formulae $$...$$ (block) or $...$ (inline)
  parts = parts.flatMap((item, i) => {
    if (typeof item !== 'string') return [item];
    return item.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g).map((part, j) => {
      // Block math $$...$$
      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const math = part.slice(2, -2);
        try {
          const html = window.katex?.renderToString(math, { displayMode: true, throwOnError: false }) || part;
          return <span key={`${ctxKey}-math-block-${i}-${j}`} className="md-math" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch { return part; }
      }
      // Inline math $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1);
        try {
          const html = window.katex?.renderToString(math, { displayMode: false, throwOnError: false }) || part;
          return <span key={`${ctxKey}-math-inline-${i}-${j}`} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch { return part; }
      }
      return part;
    });
  });

  // Images ![alt](url) — before links so the pattern doesn't conflict
  parts = parts.flatMap((item, i) => {
    if (typeof item !== 'string') return [item];
    return item.split(/(!\[[^\]]*\]\([^)]+\))/g).map((part, j) => {
      const m = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (m) {
        let src = m[2];
        if (basePath && src.startsWith('./')) {
          const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
          src = src.replace(/^\.\//, cleanBase + '/');
        }
        return (
          <img
            key={`${ctxKey}-img-${i}-${j}`}
            src={src}
            alt={m[1]}
            className="md-img"
            loading="lazy"
            decoding="async"
          />
        );
      }
      return part;
    });
  });

  // Inline code `…`
  parts = parts.flatMap((item, i) => {
    if (typeof item !== 'string') return [item];
    return item.split(/(`[^`]+`)/g).map((part, j) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={`${ctxKey}-ic-${i}-${j}`} className="md-code">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  });

  // Strikethrough ~~text~~
  parts = parts.flatMap((item, i) => {
    if (typeof item !== 'string') return [item];
    return item.split(/(~~[^~]+~~)/g).map((part, j) => {
      if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
        return (
          <del key={`${ctxKey}-del-${i}-${j}`} className="md-del">
            {processInline(part.slice(2, -2), `${ctxKey}-del-inner-${i}-${j}`, basePath)}
          </del>
        );
      }
      return part;
    });
  });

  // Bold **text** or __text__
  parts = parts.flatMap((item, i) => {
    if (typeof item !== 'string') return [item];
    return item.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((part, j) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const inner = part.slice(2, -2);
        return (
          <strong key={`${ctxKey}-b-${i}-${j}`} className="md-strong">
            {processInline(inner, `${ctxKey}-b-inner-${i}-${j}`, basePath)}
          </strong>
        );
      }
      return part;
    });
  });

  // Italic *text* or _text_ — only single markers after bold is resolved
  parts = parts.flatMap((item, i) => {
    if (typeof item !== 'string') return [item];
    // Match *word* or _word_ but NOT ** (already consumed)
    return item.split(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)|(?<!_)_(?!_)([^_]+)(?<!_)_(?!_)/g).reduce<Seg[]>((acc, part, j) => {
      if (part === undefined) return acc;
      // The regex splits into groups — odd indices are capture group content
      if (j % 3 === 0) {
        // Full match segments between delimiters
        acc.push(part);
      } else {
        // A captured italic inner text — wrap it and recurse
        acc.push(
          <em key={`${ctxKey}-em-${i}-${j}`} className="md-em">
            {processInline(part, `${ctxKey}-em-inner-${i}-${j}`, basePath)}
          </em>
        );
      }
      return acc;
    }, []);
  });

  // Links [text](url)
  parts = parts.flatMap((item, i) => {
    if (typeof item !== 'string') return [item];
    return item.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, j) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        return (
          <a key={`${ctxKey}-a-${i}-${j}`} href={m[2]}
            target="_blank" rel="noopener noreferrer"
            className="md-link">
            {m[1]}
          </a>
        );
      }
      return part;
    });
  });

  return parts.filter(p => p !== '').map((p, i) =>
    typeof p === 'string' ? <React.Fragment key={i}>{p}</React.Fragment> : p
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// ─────────────────────────────────────────────────────────────────────────────
// List item — supports nesting via indent level
// ─────────────────────────────────────────────────────────────────────────────

interface ListItem {
  depth: number;        // 0 = top level
  ordered: boolean;
  num?: string;
  content: string;
  key: string;
}

function renderListItems(items: ListItem[], basePath?: string): React.ReactNode {
  if (items.length === 0) return null;

  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];

    // Collect children (deeper depth)
    const children: ListItem[] = [];
    let j = i + 1;
    while (j < items.length && items[j].depth > item.depth) {
      children.push(items[j]);
      j++;
    }

    const childNode = children.length > 0 ? renderListItems(children, basePath) : null;

    result.push(
      <li key={item.key} className="md-li">
        {item.ordered ? (
          <span className="md-li-marker md-li-marker--num">{item.num}.</span>
        ) : (
          <span className="md-li-marker">{item.depth > 0 ? '·' : '–'}</span>
        )}
        <span className="md-li-body">
          {processInline(item.content, item.key, basePath)}
          {childNode && (
            <div className="md-li-children">
              {childNode}
            </div>
          )}
        </span>
      </li>
    );

    i = j; // skip over children — they're already rendered
  }

  return <>{result}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main renderer
// ─────────────────────────────────────────────────────────────────────────────

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, headings, basePath }) => {
  const headingIdMap = useMemo(
    () => new Map((headings ?? []).map(h => [h.text.toLowerCase(), h.id])),
    [headings]
  );

  // KaTeX is fetched only for documents that actually contain math. `katexReady`
  // flips once it lands, re-running the render so formulas replace raw $...$.
  const needsMath = useMemo(() => hasMath(content), [content]);
  const [katexReady, setKatexReady] = useState(() => typeof window !== 'undefined' && !!window.katex);

  useEffect(() => {
    if (!needsMath || katexReady) return;
    let cancelled = false;
    loadKatex()
      .then(() => { if (!cancelled) setKatexReady(true); })
      .catch(() => { /* formulas stay as source text */ });
    return () => { cancelled = true; };
  }, [needsMath, katexReady]);

  const rendered = useMemo(() => {
    // Re-render once KaTeX lands; processInline reads window.katex at call time.
    void katexReady;
    const lines = content.split('\n');
    const nodes: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeLang = '';
    let codeSnippet = '';

    // List accumulator
    let paraLines: string[] = [];
    let listItems: ListItem[] = [];
    let listOrdered = false;

    // Blockquote
    let bqLines: string[] = [];

    // Table
    let tableLines: string[] = [];

    // ── Flush helpers ──────────────────────────────────────────────────────

    const flushList = (key: string) => {
      if (listItems.length === 0) return;
      const Tag = listOrdered ? 'ol' : 'ul';
      nodes.push(
        <Tag key={key} className="md-list">
          {renderListItems(listItems, basePath)}
        </Tag>
      );
      listItems = [];
    };

    const flushBlockquote = (key: string) => {
      if (bqLines.length === 0) return;
      nodes.push(
        <blockquote key={key} className="md-quote">
          {bqLines.map((line, i) => (
            <p key={i}>
              {processInline(line, `bq-${key}-${i}`, basePath)}
            </p>
          ))}
        </blockquote>
      );
      bqLines = [];
    };

    const flushTable = (key: string) => {
      if (tableLines.length === 0) return;

      const rows = tableLines
        .filter(l => !/^\|[\s\-:|]+\|$/.test(l.trim()))
        .map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));

      if (rows.length === 0) { tableLines = []; return; }

      const [header, ...body] = rows;

      nodes.push(
        <div key={key} className="md-table-wrap">
          <table className="md-table">
            <thead>
              <tr>
                {header.map((cell, ci) => (
                  <th key={ci} scope="col">
                    {processInline(cell, `th-${key}-${ci}`, basePath)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>
                      {processInline(cell, `td-${key}-${ri}-${ci}`, basePath)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      tableLines = [];
    };

    // Markdown joins consecutive non-blank lines into one paragraph; only a
    // blank line starts a new one. Emitting a <p> per source line made every
    // hard-wrapped document render as a stack of one-line paragraphs.
    const flushPara = (key: string) => {
      if (paraLines.length === 0) return;
      const text = paraLines.join(' ');
      paraLines = [];
      nodes.push(
        <p key={key + '-p'} className="md-p">
          {processInline(text, key + '-p', basePath)}
        </p>
      );
    };

    const flushAll = (key: string) => {
      flushPara(key);
      flushList(key + '-l');
      flushBlockquote(key + '-bq');
      flushTable(key + '-t');
    };

    const getHeadingId = (text: string) =>
      headingIdMap.get(text.toLowerCase()) ?? slugify(text);

    // ── Main loop ──────────────────────────────────────────────────────────

    lines.forEach((rawLine, index) => {
      const key = `l${index}`;

      // ── Code block ──────────────────────────────────────────────────────
      if (rawLine.startsWith('```')) {
        if (inCodeBlock) {
          nodes.push(<CodeBlock key={key} lang={codeLang} code={codeSnippet} />);
          codeSnippet = ''; codeLang = ''; inCodeBlock = false;
        } else {
          flushAll(key);
          codeLang = rawLine.slice(3).trim();
          inCodeBlock = true;
        }
        return;
      }
      if (inCodeBlock) { codeSnippet += rawLine + '\n'; return; }

      // ── HR ──────────────────────────────────────────────────────────────
      if (/^(\*{3,}|-{3,}|_{3,})$/.test(rawLine.trim())) {
        flushAll(key);
        nodes.push(<hr key={key} className="md-hr" />);
        return;
      }

      // ── Table ───────────────────────────────────────────────────────────
      if (/^\|.+\|$/.test(rawLine.trim())) {
        flushList(key + '-l');
        flushBlockquote(key + '-bq');
        tableLines.push(rawLine);
        return;
      } else if (tableLines.length > 0) {
        flushTable(key + '-t');
      }

      // ── Blockquote ──────────────────────────────────────────────────────
      if (rawLine.startsWith('> ')) {
        flushList(key + '-l');
        flushTable(key + '-t');
        bqLines.push(rawLine.slice(2));
        return;
      } else if (bqLines.length > 0) {
        flushBlockquote(key + '-bq');
      }

      // ── Headings ────────────────────────────────────────────────────────
      if (/^#{1,6} /.test(rawLine)) {
        flushAll(key);
        const level = rawLine.match(/^(#+)/)?.[1].length ?? 1;
        const text = rawLine.replace(/^#+\s/, '').trim();

        if (level === 1) return; // H1 rendered by page, skip

        const id = getHeadingId(text);

        
        const Tag = `h${Math.min(level, 5)}` as 'h2' | 'h3' | 'h4' | 'h5';
        nodes.push(
          <Tag key={key} id={id} className={`md-h md-h${Math.min(level, 5)}`}>
            {processInline(text, key)}
          </Tag>
        );
        return;
      }

      // ── Lists ────────────────────────────────────────────────────────────
      // Detect indent depth for nested lists (2 spaces = 1 level)
      const ulMatch = rawLine.match(/^(\s*)([-*+]) (.+)$/);
      const olMatch = rawLine.match(/^(\s*)(\d+)\. (.+)$/);

      if (ulMatch) {
        flushBlockquote(key + '-bq');
        flushTable(key + '-t');
        if (listItems.length > 0 && listOrdered) flushList(key);
        listOrdered = false;
        const depth = Math.floor(ulMatch[1].length / 2);
        listItems.push({ depth, ordered: false, content: ulMatch[3], key });
        return;
      }

      if (olMatch) {
        flushBlockquote(key + '-bq');
        flushTable(key + '-t');
        if (listItems.length > 0 && !listOrdered) flushList(key);
        listOrdered = true;
        const depth = Math.floor(olMatch[1].length / 2);
        listItems.push({ depth, ordered: true, num: olMatch[2], content: olMatch[3], key });
        return;
      }

      // ── Empty line ───────────────────────────────────────────────────────
      if (rawLine.trim() === '') {
        flushAll(key);
        return;
      }

      // ── Paragraph ────────────────────────────────────────────────────────
      // Not flushAll: consecutive lines accumulate into a single paragraph.
      flushList(key + '-l');
      flushBlockquote(key + '-bq');
      flushTable(key + '-t');
      paraLines.push(rawLine.trim());
    });

    flushAll('end');

    return nodes;
  }, [content, headingIdMap, basePath, katexReady]);

  return (
    <div className="md-body">
      {rendered}
    </div>
  );
};

export default MarkdownRenderer;