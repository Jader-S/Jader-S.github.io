"use client";

import SectionHeader from "@/styles/atelier/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { blogPosts, csdnProfile } from "@/data/blogs";
import { formatCount } from "@/lib/format";

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
          {blogPosts.map((post) => (
            <li key={post.url} className="group border-t border-divider">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group grid grid-cols-1 gap-2 py-6 pl-0 transition-[padding,background-color,colors] duration-300 hover:bg-[var(--row-hover)] hover:pl-3 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-8 sm:py-7 sm:hover:pl-4"
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
                  <span className="mt-3 flex gap-4 font-mono text-[11px] text-faint">
                    <span>{formatCount(post.likes)} likes</span>
                    <span>{formatCount(post.views)} views</span>
                  </span>
                </span>
                <span className="text-sm text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-theme">
                  {t.common.readMore} →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t border-divider pt-8">
          <a
            href={csdnProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            {t.common.viewCsdn}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
