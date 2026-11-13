"use client";

import { useI18n } from "@/components/I18nProvider";
import { demoCatalog, projectModalCopy } from "@/data/project-details";
import { openDemoIndex } from "@/lib/project-modal";
import styles from "@/styles/shared/lab-button.module.css";

/** Shared "lab" entry for the four template styles — opens the demo index modal. */
export default function LabButton({
  className = "",
  compact = false,
}: {
  className?: string;
  /** Icon only, for dense chrome (e.g. the blueprint build-phase controls). */
  compact?: boolean;
}) {
  const { locale } = useI18n();
  const copy = projectModalCopy[locale];

  return (
    <button
      type="button"
      className={`${styles.button} ${compact ? styles.compact : ""} ${className}`}
      onClick={openDemoIndex}
      aria-label={`${copy.lab} · ${copy.labSub}`}
      title={`${copy.lab} · ${copy.labSub}`}
    >
      <span className={styles.icon} aria-hidden="true">
        ◈
      </span>
      {compact ? null : (
        <>
          <span>{copy.lab}</span>
          <span className={styles.count}>{copy.demoCount(demoCatalog.length)}</span>
          <span aria-hidden="true">→</span>
        </>
      )}
    </button>
  );
}
