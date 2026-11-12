/**
 * Content service (ADR-1). Local-first: import.meta.glob maps all MDX files
 * at build time. M7 will swap this for a remote API while keeping the same
 * shape.
 */
import type { ComponentType } from 'react';

const modules = import.meta.glob<{
  default: ComponentType;
  frontmatter: Record<string, unknown>;
}>('../content/blog/*.mdx', { eager: false });

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}

function slugFromPath(path: string): string {
  const file = path.split('/').pop() ?? '';
  return file.replace(/\.mdx?$/, '');
}

function toMeta(path: string, fm: Record<string, unknown>): BlogPostMeta {
  const slug = slugFromPath(path);
  return {
    slug,
    title: (fm.title as string) ?? slug,
    date: (fm.date as string) ?? '',
    tags: (fm.tags as string[]) ?? [],
    excerpt: (fm.excerpt as string) ?? '',
  };
}

export async function getBlogIndex(): Promise<BlogPostMeta[]> {
  const entries = await Promise.all(
    Object.entries(modules).map(async ([path, getter]) => {
      const mod = await getter();
      return toMeta(path, (mod.frontmatter ?? {}) as Record<string, unknown>);
    }),
  );
  return entries;
}

export async function loadBlogPost(slug: string) {
  const entry = Object.entries(modules).find(([p]) => slugFromPath(p) === slug);
  if (!entry) throw new Error(`Blog post not found: ${slug}`);
  const mod = await entry[1]();
  return {
    default: mod.default,
    frontmatter: mod.frontmatter,
  };
}