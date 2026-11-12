"use client";

import ContentCard from "@/styles/classic/components/ContentCard";
import SectionHeader from "@/styles/classic/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { blogPosts, csdnProfile } from "@/data/blogs";
import { formatCount } from "@/lib/format";

export default function BlogSection() {
  const { t } = useI18n();

  return (
    <section id="blog" className="classic-section-shell-frost">
      <div className="classic-section-inner">
        <SectionHeader
          index={t.blog.index}
          title={t.blog.title}
          subtitle={t.blog.subtitle}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <ContentCard
              key={post.url}
              title={post.title}
              description={post.description}
              href={post.url}
              badge={index === 0 ? t.common.hot : undefined}
              highlight={index === 0}
              clampDescription
              linkLabel={`${t.common.readMore} →`}
              footer={
                <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-faint">
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 10v12"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-3.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
                      />
                    </svg>
                    {formatCount(post.likes)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    {formatCount(post.views)}
                  </span>
                  {post.date && (
                    <time dateTime={post.date} className="ml-auto">
                      {post.date}
                    </time>
                  )}
                </div>
              }
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={csdnProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost !mx-auto !inline-flex !w-auto"
          >
            {t.common.viewCsdn} →
          </a>
        </div>
      </div>
    </section>
  );
}
