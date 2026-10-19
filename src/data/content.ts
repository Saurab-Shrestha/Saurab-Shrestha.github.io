import { parseMarkdown, asText, asList } from '../utils/markdown';

const blogFiles = import.meta.glob('./blog/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const projectFiles = import.meta.glob('./projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export interface ProjectContent {
  id: string;
  name: string;
  tag: string;
  year: string;
  role: string;
  desc: string;
  tech: string[];
  github: string;
  /** Rendered by <ProjectThumbnail>: "svg:<key>" or "img:<public path>". */
  thumbnail: string;
  markdown: string;
}

export interface BlogContent {
  id: string;
  tag: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  markdown: string;
}

/**
 * Display order for the work list. Projects not named here still resolve by URL
 * but won't be listed, so adding a .md file alone never silently changes the page.
 */
const PROJECT_ORDER = ['pranama', 'hdes', 'tdd', 'svufe'];

export const PROJECTS_CONTENT: Record<string, ProjectContent> = Object.entries(projectFiles).reduce(
  (acc, [path, rawContent]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const { metadata, content } = parseMarkdown(rawContent);

    acc[slug] = {
      id: slug,
      name: asText(metadata.name, slug),
      tag: asText(metadata.tag, 'Project'),
      year: asText(metadata.year),
      role: asText(metadata.role),
      desc: asText(metadata.desc),
      tech: asList(metadata.tech),
      github: asText(metadata.github),
      thumbnail: asText(metadata.thumbnail),
      markdown: content,
    };

    return acc;
  },
  {} as Record<string, ProjectContent>
);

/** Projects in display order, skipping any listed slug with no matching file. */
export const PROJECTS_LIST: ProjectContent[] = PROJECT_ORDER
  .map(id => PROJECTS_CONTENT[id])
  .filter(Boolean);

// Process dynamically imported blog files
export const BLOGS_CONTENT: Record<string, BlogContent> = Object.entries(blogFiles).reduce(
  (acc, [path, rawContent]) => {
    // Extract slug from path (e.g., './blog/slug/file.md' -> 'slug')
    const pathParts = path.split('/');
    const slug = pathParts[pathParts.length - 2];

    const { metadata, content } = parseMarkdown(rawContent);

    acc[slug] = {
      id: slug,
      tag: asText(metadata.tag, 'Blog'),
      title: asText(metadata.title, 'Untitled Post'),
      date: asText(metadata.date, 'Unknown Date'),
      readTime: asText(metadata.readTime, '5 min read'),
      excerpt: asText(metadata.excerpt),
      markdown: content,
    };

    return acc;
  },
  {} as Record<string, BlogContent>
);


/**
 * Posts newest first. The raw glob yields alphabetical-by-path order, which made
 * the numbering on /blog arbitrary.
 */
export const BLOGS_LIST: BlogContent[] = Object.values(BLOGS_CONTENT).sort(
  (a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0)
);

/** ISO date for <time dateTime>, or undefined when the frontmatter date is unparseable. */
export const isoDate = (date: string): string | undefined => {
  const t = Date.parse(date);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10);
};
