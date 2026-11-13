"use client";

import { useI18n } from "@/components/I18nProvider";
import { blogPosts } from "@/data/blogs";
import { formatCount } from "@/lib/format";

export default function BlogSection() {
  const { t } = useI18n();
  const posts = blogPosts.filter((p) => p.theme === "blueprint");

  return (
    <section id="blog" className="blueprint-section">
      <p className="blueprint-eyebrow">{t.blog.index}</p>
      <h2 className="blueprint-title">{t.blog.title}</h2>
      <p className="blueprint-body">{t.blog.subtitle}</p>
      <ul className="mt-8 space-y-0 border-t border-divider">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-divider">
            <a
              href={`/blueprint/blog/${post.slug}`}
              className="focus-ring block py-4 transition-colors hover:bg-[var(--nav-hover)]"
            >
              <p className="text-[15px] text-heading">{post.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{post.description}</p>
              <p className="mt-2 font-mono text-[11px] text-faint">
                {post.date} · {formatCount(post.views)} views
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
