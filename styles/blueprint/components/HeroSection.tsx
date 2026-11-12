"use client";

import { useI18n } from "@/components/I18nProvider";
import { profile } from "@/data/profile";

interface HeroSectionProps {
  onReplay?: () => void;
}

export default function HeroSection({ onReplay }: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <section id="top" className="blueprint-section blueprint-ink-reveal">
      <p className="blueprint-eyebrow">{t.hero.role}</p>
      <h1 className="blueprint-title" translate="no">
        {t.profile.name}
      </h1>
      <p className="mt-2 text-sm text-theme sm:text-base">{t.profile.title}</p>
      <p className="blueprint-body">{t.profile.tagline}</p>
      <ul className="mt-8 flex flex-wrap gap-2">
        {t.profile.highlights.map((item) => (
          <li key={item.label} className="blueprint-chip">
            <span className="text-faint">{item.label}</span>{" "}
            <span className="text-heading">{item.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          className="blueprint-link"
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.hero.github}
          <span aria-hidden="true">→</span>
        </a>
        <a className="blueprint-link" href="#about">
          {t.about.title}
          <span aria-hidden="true">→</span>
        </a>
        {onReplay ? (
          <button type="button" className="blueprint-link" onClick={onReplay}>
            {t.blueprint.replayBuild}
            <span aria-hidden="true">↻</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
