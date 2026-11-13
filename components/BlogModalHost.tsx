"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import BlogPostReader from "@/components/BlogPostReader";
import { useI18n } from "@/components/I18nProvider";
import { getBlogContent } from "@/data/blog-content";
import { blogPosts, getPostBySlug } from "@/data/blogs";
import {
  closeBlog,
  openBlog,
  openBlogIndex,
  useBlogModalStore,
} from "@/lib/blog-modal";
import styles from "@/styles/shared/blog-modal.module.css";

const SORTED_POSTS = [...blogPosts].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0
);

/** 全部日志列表：ASTRA 的「日志」星球从这里进入，四主题也可通过「全部日志」回到这里。 */
function IndexList() {
  const { t } = useI18n();

  return (
    <div>
      <h2 className={styles.indexTitle} id="blog-modal-title">
        {t.blog.title}
      </h2>
      <span className={styles.indexCount}>{t.blog.postCount(SORTED_POSTS.length)}</span>
      <ul className={styles.indexList}>
        {SORTED_POSTS.map((post) => (
          <li key={post.slug}>
            <button
              type="button"
              className={styles.indexItem}
              onClick={() => openBlog(post.slug)}
            >
              <time className={styles.indexDate} dateTime={post.date}>
                {post.date}
              </time>
              <span>
                <span className={styles.indexName}>{post.title}</span>
                <span className={styles.indexDesc}>{post.description}</span>
              </span>
              <span className={styles.indexArrow} aria-hidden="true">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostView({ slug }: { slug: string }) {
  const { t } = useI18n();
  const post = getPostBySlug(slug);
  if (!post) {
    return (
      <p className={styles.empty} id="blog-modal-title">
        {t.blog.notFound}
      </p>
    );
  }

  const content = getBlogContent(slug);
  if (!content) {
    return (
      <p className={styles.empty} id="blog-modal-title">
        {t.blog.emptyBody}
      </p>
    );
  }

  return <BlogPostReader post={post} content={content} />;
}

/**
 * 全局博客弹框宿主。挂在 AppProviders 里一次，5 套主题共用。
 *
 * Portal 到 document.body 是必须的：particle 有 snap-scroll 容器、atelier 有
 * 层叠上下文、R3F 有独立 Canvas，直接渲染在主题树里会被 transform / overflow
 * 裁剪或压在 fixed 悬浮层下面。
 */
export default function BlogModalHost() {
  const { t } = useI18n();
  const view = useBlogModalStore((state) => state.view);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const isOpen = view.kind !== "closed";

  useEffect(() => {
    if (!isOpen) return;

    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    // 锁滚动时补上滚动条宽度，避免背景页面横向跳动。
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBlog();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      opener?.focus?.();
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const onOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeBlog();
  };

  return createPortal(
    <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-modal-title"
        className={styles.panel}
      >
        <div className={styles.bar}>
          {view.kind === "post" ? (
            <button type="button" className={styles.back} onClick={openBlogIndex}>
              ← {t.blog.allPosts}
            </button>
          ) : (
            <span className={styles.barLabel}>BLOG · JADERAI</span>
          )}
          <button
            type="button"
            className={styles.close}
            onClick={closeBlog}
            aria-label={t.blog.close}
          >
            ✕
          </button>
        </div>
        <div className={styles.scroll}>
          {view.kind === "index" ? <IndexList /> : <PostView slug={view.slug} />}
        </div>
      </div>
    </div>,
    document.body
  );
}
