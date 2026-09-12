/**
 * Simple markdown frontmatter parser.
 * Extracts YAML-style metadata between --- markers at the top of a string.
 */
export function parseMarkdown(rawContent: string) {
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = rawContent.match(frontMatterRegex);

  if (!match) {
    return { metadata: {}, content: rawContent };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const metadata: Record<string, string | string[]> = {};

  const unquote = (v: string) => v.trim().replace(/^["']|["']$/g, '');

  // Simple key-value pair parsing for YAML
  yamlBlock.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const raw = valueParts.join(':').trim();
      // Inline list: tech: ["Python", "FastAPI"]
      metadata[key.trim()] = raw.startsWith('[') && raw.endsWith(']')
        ? raw.slice(1, -1).split(',').map(unquote).filter(Boolean)
        : unquote(raw);
    }
  });

  return { metadata, content };
}

/** Read a frontmatter value that must be a string. */
export const asText = (v: string | string[] | undefined, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

/** Read a frontmatter value that must be a list. */
export const asList = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
