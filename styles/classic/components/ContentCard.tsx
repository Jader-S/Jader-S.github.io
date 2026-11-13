import type { ReactNode } from "react";

interface ContentCardProps {
  title: string;
  description: string;
  /** 页面跳转；外部仓库链接会自动保留新标签。与 onClick 二选一。 */
  href?: string;
  /** 当前页打开弹框（博客正文）；优先于 href。 */
  onClick?: () => void;
  badge?: string;
  highlight?: boolean;
  clampDescription?: boolean;
  footer?: ReactNode;
  linkLabel?: string;
  /** 可选稳定选择器，供 E2E 断言作品卡数量。 */
  testId?: string;
}

export default function ContentCard({
  title,
  description,
  href,
  onClick,
  badge,
  highlight = false,
  clampDescription = false,
  footer,
  linkLabel,
  testId,
}: ContentCardProps) {
  // Site-internal links stay in the current tab; external repo links keep the
  // opener tab intact. onClick short-circuits both and opens an in-page modal.
  const isInternal = href?.startsWith("/") ?? false;
  const linkProps = isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" };
  const hasAction = Boolean(onClick || href);

  const titleClass = `focus-ring rounded-sm hover:underline ${clampDescription ? "line-clamp-2" : ""}`;
  const linkClass =
    "focus-ring mt-4 inline-flex items-center gap-1 text-sm text-theme transition-colors hover:text-theme-light";

  const titleNode = onClick ? (
    <button type="button" onClick={onClick} className={`${titleClass} text-left`}>
      {title}
    </button>
  ) : href ? (
    <a href={href} {...linkProps} className={titleClass}>
      {title}
    </a>
  ) : (
    title
  );

  const footerLink = !linkLabel ? null : onClick ? (
    <button type="button" onClick={onClick} className={linkClass}>
      {linkLabel}
    </button>
  ) : href ? (
    <a href={href} {...linkProps} className={linkClass}>
      {linkLabel}
    </a>
  ) : null;

  return (
    <article
      data-testid={testId}
      className={`glass-card-interactive group flex h-full flex-col p-5 sm:p-6 ${
        highlight ? "ring-1 ring-theme/20" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3
          className={`text-base font-semibold leading-snug text-heading transition-colors group-hover:text-theme-light sm:text-lg ${
            clampDescription ? "min-w-0" : ""
          } ${clampDescription && !hasAction ? "line-clamp-2" : ""}`}
        >
          {titleNode}
        </h3>
        {badge && (
          <span className="shrink-0 rounded-md bg-theme px-2 py-0.5 text-[11px] font-medium text-white">
            {badge}
          </span>
        )}
      </div>

      <p
        className={`text-sm leading-relaxed text-muted text-pretty ${
          clampDescription ? "mb-4 line-clamp-3" : "mb-5 flex-1"
        }`}
      >
        {description}
      </p>

      {footer}

      {footerLink}
    </article>
  );
}
