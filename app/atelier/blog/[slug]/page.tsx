import BlogPostPage from "@/components/BlogPostPage";
import type { StyleMode } from "@/styles/registry";

const THEME: StyleMode = "atelier";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostPage theme={THEME} slug={slug} />;
}
