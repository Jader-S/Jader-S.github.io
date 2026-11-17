"use client";

import SectionHeader from "@/styles/atelier/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { blogPosts } from "@/data/blogs";
import { openBlog } from "@/lib/blog-modal";
import { formatCount } from "@/lib/format";
import BlogButton from "@/styles/shared/chrome/BlogButton";

export default function BlogSection() {
  const { t } = useI18n();

  return (
    <section id="blog" className="section-shell">
      <div className="section-inner">
        <SectionHeader
          eyebrow="Writing"
          title={t.blog.title}
          subtitle={t.blog.subtitle}
        />

        <ul>
          {blogPosts
            .filter((p) => p.theme === "atelier")
            .map((post) => (
              <li key={post.slug} className="group border-t border-divider">
                <button
                  type="button"
                  data-testid="blog-card"
                  onClick={() => openBlog(post.slug)}
                  className="focus-ring group grid w-full grid-cols-1 gap-2 py-6 pl-0 text-left transition-[padding,background-color,colors] duration-300 hover:bg-[var(--row-hover)] hover:pl-3 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-8 sm:py-7 sm:hover:pl-4"
                >
                  <time
                    dateTime={post.date || undefined}
                    className="font-mono text-[11px] tracking-wide text-faint"
                  >
                    {post.date || "—"}
                  </time>
                  <span>
                    <span className="block text-[15px] text-heading transition-colors duration-300 group-hover:text-theme sm:text-base text-balance">
                      {post.title}
                    </span>
                    <span className="mt-2 block text-sm text-muted line-clamp-2 text-pretty">
                      {post.description}
                    </span>
                    {post.likes > 0 || post.views > 0 ? (
                      <span className="mt-3 flex gap-4 font-mono text-[11px] text-faint">
                        {post.likes > 0 ? (
                          <span>
                            {formatCount(post.likes)} {t.blog.likes}
                          </span>
                        ) : null}
                        {post.views > 0 ? (
                          <span>
                            {formatCount(post.views)} {t.blog.views}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-theme">
                    {t.common.readMore} →
                  </span>
                </button>
              </li>
            ))}
        </ul>

        <div className="mt-8 flex justify-end">
          <BlogButton />
        </div>
      </div>
    </section>
  );
}
