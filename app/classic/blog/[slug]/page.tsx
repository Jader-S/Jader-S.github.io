import BlogPostPage from "@/components/BlogPostPage";
import { getPostsByTheme } from "@/data/blogs";
import type { StyleMode } from "@/styles/registry";

const THEME: StyleMode = "classic";

/** Enumerate slugs so `output: "export"` can prerender every post. */
export function generateStaticParams() {
  return getPostsByTheme(THEME).map((post) => ({ slug: post.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostPage theme={THEME} slug={slug} />;
}
