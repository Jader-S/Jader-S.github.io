import type { ReactNode } from "react";

interface ContentCardProps {
  title: string;
  description: string;
  href?: string;
  badge?: string;
  highlight?: boolean;
  clampDescription?: boolean;
  footer?: ReactNode;
  linkLabel?: string;
}

export default function ContentCard({
  title,
  description,
  href,
  badge,
  highlight = false,
  clampDescription = false,
  footer,
  linkLabel,
}: ContentCardProps) {
  return (
    <article
      className={`glass-card-interactive group flex h-full flex-col p-5 sm:p-6 ${
        highlight ? "ring-1 ring-theme/20" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3
          className={`text-base font-semibold leading-snug text-heading transition-colors group-hover:text-theme-light sm:text-lg ${
            clampDescription ? "min-w-0" : ""
          } ${clampDescription && !href ? "line-clamp-2" : ""}`}
        >
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`focus-ring rounded-sm hover:underline ${
                clampDescription ? "line-clamp-2" : ""
              }`}
            >
              {title}
            </a>
          ) : (
            title
          )}
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

      {href && linkLabel && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-4 inline-flex items-center gap-1 text-sm text-theme transition-colors hover:text-theme-light"
        >
          {linkLabel}
        </a>
      )}
    </article>
  );
}
