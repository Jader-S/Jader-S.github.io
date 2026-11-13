"use client";

import { useI18n } from "@/components/I18nProvider";
import { demoCatalog } from "@/data/project-details";
import { openDemo } from "@/lib/project-modal";
import styles from "@/styles/shared/lab-section.module.css";

export type LabStyle = "atelier" | "classic" | "blueprint" | "particle";

/**
 * 共享「实验室」区块（Phase 8）：与「作品」并列的一级菜单。
 *
 * 平铺 demoCatalog 的 6 个 Demo 卡片，点击在当前页打开 Demo 详情弹框
 * （不新开标签、不跳路由）。外壳由各主题提供（section 类名 + 标题），
 * 卡片统一用主题 token 配色，保证浅色 / 深色主题下文字对比度。
 */
export default function LabSection({ style }: { style: LabStyle }) {
  const { t, locale } = useI18n();

  return (
    <section id="lab" data-style={style} className={styles.section}>
      <header className={styles.header}>
        <p className={styles.index}>{t.lab.index}</p>
        <h2 className={styles.title}>{t.lab.title}</h2>
        <p className={styles.subtitle}>{t.lab.subtitle}</p>
      </header>

      <ul className={styles.grid}>
        {demoCatalog.map((demo) => (
          <li key={demo.slug}>
            <button
              type="button"
              data-testid="lab-card"
              className={styles.card}
              onClick={() => openDemo(demo.slug, { kind: "lab" })}
            >
              <span className={styles.tag} translate="no">
                {demo.category}
                {demo.heavy3d ? " · 3D" : ""}
                {demo.wide ? " · WIDE" : ""}
              </span>
              <span className={styles.name}>{demo.title[locale]}</span>
              <span className={styles.desc}>{demo.desc[locale]}</span>
              <span className={styles.hint}>{t.lab.openHint}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
