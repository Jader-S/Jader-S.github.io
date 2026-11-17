"use client";

import { useI18n } from "@/components/I18nProvider";
import { blogPosts } from "@/data/blogs";
import { openBlogIndex } from "@/lib/blog-modal";
import styles from "@/styles/shared/blog-button.module.css";

/**
 * 共享「全部日志」入口：直接打开完整博客列表弹框。
 * 四套主题模板页与蓝图画布工具栏都用它，避免只能「点进单篇 → 返回」才看到全表。
 */
export default function BlogButton({
  className = "",
  compact = false,
}: {
  className?: string;
  /** Icon only, for dense chrome (e.g. the blueprint build-phase controls). */
  compact?: boolean;
}) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className={`${styles.button} ${compact ? styles.compact : ""} ${className}`}
      onClick={openBlogIndex}
      aria-label={t.blog.allPosts}
      title={t.blog.allPosts}
    >
      <span className={styles.icon} aria-hidden="true">
        ▤
      </span>
      {compact ? null : (
        <>
          <span>{t.blog.allPosts}</span>
          <span className={styles.count}>{t.blog.postCount(blogPosts.length)}</span>
          <span aria-hidden="true">→</span>
        </>
      )}
    </button>
  );
}
