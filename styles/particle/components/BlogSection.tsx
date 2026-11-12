"use client";

import { useI18n } from "@/components/I18nProvider";
import { blogPosts, csdnProfile } from "@/data/blogs";
import { formatCount } from "@/lib/format";

export default function BlogSection() {
  const { t } = useI18n();
  const posts = blogPosts.slice(0, 5);

  return (
    <section id="blog" className="particle-section">
      <p className="particle-eyebrow">{t.blog.index}</p>
      <h2 className="particle-title">{t.blog.title}</h2>
      <p className="particle-body">{t.blog.subtitle}</p>
      <ul className="mt-8 space-y-0 border-t border-divider">
        {posts.map((post) => (
          <li key={post.url} className="border-b border-divider">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
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
      <a
        className="particle-link mt-6"
        href={csdnProfile}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.common.viewCsdn}
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
