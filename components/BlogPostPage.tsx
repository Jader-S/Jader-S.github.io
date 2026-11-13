import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import AppProviders from "@/styles/shared/providers/AppProviders";
import { getThemePost } from "@/data/blogs";
import type { StyleMode } from "@/styles/registry";
import BlogPostReader from "@/components/BlogPostReader";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

/** 去掉 MDX 顶部 frontmatter（--- ... ---），仅保留正文 */
function stripFrontmatter(raw: string): string {
  const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
  return m ? raw.slice(m[0].length) : raw;
}

/**
 * 主题化博客展示页（服务端渲染）。
 * 由 app/<theme>/blog/[slug]/page.tsx 调用，theme 写死在各自路由里。
 * MDX 正文在此用 fs 读取并去 frontmatter，交给客户端 BlogPostReader 渲染——
 * 这样点击主题页里的日志后，在「对应主题」视觉下本地展示，不跳外部站点、不进 3D 太空。
 */
export default async function BlogPostPage({
  theme,
  slug,
}: {
  theme: StyleMode;
  slug: string;
}) {
  const post = getThemePost(theme, slug);
  if (!post) notFound();

  let content = "";
  try {
    const file = path.join(CONTENT_DIR, `${post.slug}.mdx`);
    content = await fs.readFile(file, "utf8");
  } catch {
    content = "";
  }

  return (
    <AppProviders style={theme}>
      <BlogPostReader post={post} content={stripFrontmatter(content)} />
    </AppProviders>
  );
}
