"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useStyle } from "@/styles/shared/providers/StyleProvider";
import { buildSkillSharePrompt, copyText } from "@/lib/skillShare";

function AiSparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2l1.15 4.35L17.5 8.7l-4.35 1.15L12 14.2l-1.15-4.35L6.5 8.7l4.35-1.15L12 3.2z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M18.2 13.2l.7 2.55 2.55.7-2.55.7-.7 2.55-.7-2.55-2.55-.7 2.55-.7.7-2.55z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M6.4 14.4l.55 1.95 1.95.55-1.95.55-.55 1.95-.55-1.95-1.95-.55 1.95-.55.55-1.95z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l4.2 4.2L19 7.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Right floating AI control — copy skill prompt; tooltip explains on hover. */
export default function SkillShareRail() {
  const { style, chrome } = useStyle();
  const { locale, t } = useI18n();
  const isClassicChrome = chrome === "classic";
  const tooltipId = useId();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [status]);

  const onCopy = useCallback(async () => {
    const prompt = buildSkillSharePrompt(style, locale);
    const ok = await copyText(prompt);
    setStatus(ok ? "copied" : "failed");
  }, [style, locale]);

  const showTooltip = hovered || status !== "idle";
  const tooltipTitle =
    status === "copied"
      ? t.skillShare.copied
      : status === "failed"
        ? t.skillShare.copyFailed
        : t.skillShare.tooltipTitle;
  const tooltipBody =
    status === "idle" ? t.skillShare.hint : t.skillShare.tooltipDoneHint;

  return (
    <div
      className="pointer-events-auto fixed right-3 top-1/2 z-[60] flex -translate-y-1/2 items-center gap-2 sm:right-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHovered(false);
        }
      }}
    >
      <div
        id={tooltipId}
        role="tooltip"
        className={`max-w-[11.5rem] rounded-xl border px-3 py-2.5 shadow-lg backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 sm:max-w-[13rem] ${
          isClassicChrome
            ? "border-[var(--glass-border)] bg-[var(--glass-bg)]"
            : "border-divider bg-[var(--nav-bg-solid)]"
        } ${
          showTooltip
            ? "visible translate-x-0 opacity-100"
            : "invisible translate-x-1 opacity-0 pointer-events-none"
        }`}
      >
        <p className="text-xs font-semibold tracking-wide text-heading">
          {tooltipTitle}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">{tooltipBody}</p>
      </div>

      <button
        type="button"
        onClick={() => void onCopy()}
        aria-label={t.skillShare.ariaLabel}
        aria-describedby={tooltipId}
        className={`skill-ai-fab focus-ring group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition-[transform,box-shadow] duration-300 hover:scale-105 active:scale-95 sm:h-[3.25rem] sm:w-[3.25rem] ${
          isClassicChrome
            ? "shadow-[0_10px_28px_rgba(13,148,136,0.28)]"
            : "shadow-[0_10px_28px_rgba(143,115,85,0.28)]"
        } ${status === "copied" ? "ring-2 ring-theme/50" : ""}`}
      >
        <span
          className="absolute inset-0 bg-[linear-gradient(145deg,var(--theme-accent-light),var(--theme-accent)_45%,color-mix(in_srgb,var(--theme-accent)_70%,#6366f1))] opacity-95 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -inset-3 rounded-full bg-theme/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-[1px] rounded-full bg-white/10"
          aria-hidden="true"
        />
        <span className="relative z-10 text-white drop-shadow-sm">
          {status === "copied" ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <AiSparkIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          )}
        </span>
      </button>
    </div>
  );
}
