"use client";

import { useI18n } from "@/components/I18nProvider";
import { csdnProfile } from "@/data/blogs";
import { profile } from "@/data/profile";

export default function FooterSection() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const index = [
    { label: t.hero.github, href: profile.github, external: true },
    { label: t.footer.about, href: "#about", external: false },
    { label: t.footer.blog, href: "#blog", external: false },
    { label: t.footer.csdn, href: csdnProfile, external: true },
  ];

  return (
    <footer className="border-t border-divider px-5 pb-10 pt-16 sm:px-8 lg:px-12">
      <p
        className="blueprint-display text-[clamp(3.5rem,12vw,7.5rem)] font-semibold leading-none tracking-tight text-heading"
        translate="no"
      >
        {t.profile.name}
      </p>

      <nav className="mt-10 border-t border-divider" aria-label={t.navAria.footer}>
        {index.map((item, itemIndex) => (
          <a
            key={item.label}
            className="focus-ring group flex items-baseline gap-6 border-b border-divider py-4 text-heading transition-colors hover:text-theme"
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
          >
            <span className="w-8 font-mono text-[11px] tracking-wide text-faint">
              {String(itemIndex + 1).padStart(2, "0")}
            </span>
            <span className="blueprint-display text-[clamp(1.35rem,2.4vw,1.85rem)] font-medium tracking-tight">
              {item.label}
            </span>
          </a>
        ))}
      </nav>

      <p className="mt-6 text-sm text-faint" translate="no">
        © {year} {t.profile.name}. {t.common.footerTech}
      </p>
    </footer>
  );
}
