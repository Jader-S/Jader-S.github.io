"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import DemoPreview from "@/components/DemoPreview";
import { useI18n } from "@/components/I18nProvider";
import {
  demoCatalog,
  getDemoMeta,
  getProjectDetail,
  projectModalCopy,
  type DemoSlug,
  type Locale,
  type ProjectId,
} from "@/data/project-details";
import {
  enterpriseProjects,
  githubProjects,
  type EnterpriseProjectId,
  type GithubProjectId,
} from "@/data/projects";
import {
  backProjectModal,
  closeProjectModal,
  openDemo,
  openDemoIndex,
  useProjectModalStore,
} from "@/lib/project-modal";
import type { LocaleMessages } from "@/lib/i18n";
import modal from "@/styles/shared/blog-modal.module.css";
import styles from "@/styles/shared/project-modal.module.css";

const TITLE_ID = "project-modal-title";

function isEnterprise(id: ProjectId): id is EnterpriseProjectId {
  return enterpriseProjects.some((project) => project.id === id);
}

function nameOf(id: ProjectId, t: LocaleMessages): string {
  return isEnterprise(id)
    ? t.enterprise.projects[id].name
    : t.github.projects[id as GithubProjectId].name;
}

function techOf(id: ProjectId): string[] {
  return (
    [...enterpriseProjects, ...githubProjects].find((p) => p.id === id)?.tech ?? []
  );
}

function ProjectView({
  id,
  t,
  locale,
}: {
  id: ProjectId;
  t: LocaleMessages;
  locale: Locale;
}) {
  const copy = projectModalCopy[locale];
  const detail = getProjectDetail(id);
  const body = detail?.text[locale];

  return (
    <div className={styles.view}>
      <h1 className={styles.title} id={TITLE_ID}>
        {nameOf(id, t)}
      </h1>
      <div className={styles.chips}>
        {techOf(id).map((tech) => (
          <span className={styles.chip} key={tech} translate="no">
            {tech}
          </span>
        ))}
      </div>

      {body ? (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{copy.background}</h2>
            <p className={styles.paragraph}>{body.background}</p>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{copy.role}</h2>
            <p className={styles.paragraph}>{body.role}</p>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{copy.outcomes}</h2>
            <ul className={styles.outcomes}>
              {body.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{copy.demos}</h2>
            {detail.demos.length > 0 ? (
              <ul className={styles.demoList}>
                {detail.demos.map((slug) => {
                  const meta = getDemoMeta(slug);
                  return (
                    <li key={slug}>
                      <button
                        type="button"
                        data-testid="demo-item"
                        className={styles.demoItem}
                        onClick={() => openDemo(slug)}
                      >
                        <span className={styles.demoTag}>
                          {meta?.category ?? "demo"}
                        </span>
                        <span className={styles.demoName}>
                          {meta?.title[locale] ?? slug}
                        </span>
                        <span className={styles.demoDesc}>
                          {meta?.desc[locale] ?? ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.empty}>{copy.noDemos}</p>
            )}
            <button type="button" className={styles.allDemos} onClick={openDemoIndex}>
              {copy.allDemos} →
            </button>
          </section>
        </>
      ) : (
        <p className={styles.empty}>{copy.noDemos}</p>
      )}
    </div>
  );
}

function DemoIndexView({ locale }: { locale: Locale }) {
  const copy = projectModalCopy[locale];
  return (
    <div className={styles.view}>
      <h1 className={styles.title} id={TITLE_ID}>
        {copy.lab}
      </h1>
      <p className={styles.subtitle}>
        {copy.labSub} · {copy.demoCount(demoCatalog.length)}
      </p>
      <ul className={styles.demoList}>
        {demoCatalog.map((demo) => (
          <li key={demo.slug}>
            <button
              type="button"
              data-testid="demo-item"
              className={styles.demoItem}
              onClick={() => openDemo(demo.slug)}
            >
              <span className={styles.demoTag}>{demo.category}</span>
              <span className={styles.demoName}>{demo.title[locale]}</span>
              <span className={styles.demoDesc}>{demo.desc[locale]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DemoView({ slug, locale }: { slug: DemoSlug; locale: Locale }) {
  const copy = projectModalCopy[locale];
  const meta = getDemoMeta(slug);
  return (
    <div className={styles.view}>
      <h1 className={styles.title} id={TITLE_ID}>
        {meta?.title[locale] ?? slug}
      </h1>
      {meta?.heavy3d ? <p className={styles.note}>{copy.heavyHint}</p> : null}
      <DemoPreview slug={slug} locale={locale} />
    </div>
  );
}

/**
 * Shared project detail / lab modal for all five styles.
 * Portaled to <body> for the same reasons as BlogModalHost (snap-scroll
 * containers, transformed layers, R3F's separate reconciler).
 */
export default function ProjectModalHost() {
  const { t, locale } = useI18n();
  const view = useProjectModalStore((state) => state.view);
  const copy = projectModalCopy[locale];
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const isOpen = view.kind !== "closed";

  useEffect(() => {
    if (!isOpen) return;

    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProjectModal();
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
    if (event.target === event.currentTarget) closeProjectModal();
  };

  return createPortal(
    <div className={modal.overlay} onMouseDown={onOverlayMouseDown}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className={modal.panel}
      >
        <div className={modal.bar}>
          {view.kind === "demo" ? (
            <button type="button" className={modal.back} onClick={backProjectModal}>
              {view.returnTo.kind === "project" ? copy.backToProject : copy.backToLab}
            </button>
          ) : (
            <span className={modal.barLabel}>
              {view.kind === "project" ? "PROJECT · JADERAI" : "LAB · JADERAI"}
            </span>
          )}
          <button
            type="button"
            className={modal.close}
            onClick={closeProjectModal}
            aria-label={copy.close}
          >
            ✕
          </button>
        </div>
        <div className={modal.scroll}>
          {view.kind === "project" ? (
            <ProjectView id={view.id} t={t} locale={locale} />
          ) : view.kind === "demos" ? (
            <DemoIndexView locale={locale} />
          ) : (
            <DemoView slug={view.slug} locale={locale} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
