"use client";

import { useSyncExternalStore } from "react";
import Shatter from "@/styles/atelier/components/canvasui/Shatter";
import { useI18n } from "@/components/I18nProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useViewport } from "@/lib/hooks/useViewport";
import { profile } from "@/data/profile";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true
  );
}

export default function FooterSection() {
  const { t } = useI18n();
  const { resolved } = useTheme();
  const { isMobile } = useViewport();
  const reducedMotion = usePrefersReducedMotion();
  const year = new Date().getFullYear();
  const useShatter = !isMobile && !reducedMotion;
  const gapColor: [number, number, number] =
    resolved === "dark" ? [0.06, 0.06, 0.07] : [0.96, 0.94, 0.91];

  const logo = (
    <p
      className="select-none font-serif text-[clamp(3.5rem,14vw,9rem)] font-medium leading-none tracking-tight text-heading"
      translate="no"
    >
      Jader Sun
    </p>
  );

  return (
    <footer className="border-t border-divider px-4 pb-10 pt-16 sm:px-6 sm:pb-12 sm:pt-20 md:px-8">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-14 sm:mb-16">
          {useShatter ? (
            <Shatter
              className="w-full"
              radius={0.55}
              softness={0.55}
              tileSize={72}
              shards={0.85}
              lift={28}
              tilt={1.6}
              scatter={6}
              perspective={1200}
              gapColor={gapColor}
              shadow={0.45}
              shading={0.55}
              refraction={1.2}
              dispersion={0.25}
              floatSpeed={1.6}
              strength={1}
              baseStrength={0.22}
              followSpeed={3.2}
            >
              {logo}
            </Shatter>
          ) : (
            logo
          )}
        </div>

        <div className="flex flex-col gap-10 border-t border-divider pt-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-xl font-medium tracking-tight text-heading">
              {t.profile.name}
            </p>
            <p className="mt-2 text-sm text-faint">
              {t.profile.title} · {profile.yearsOfExperience} {t.common.yearsExpShort}
            </p>
          </div>

          <nav
            aria-label={t.navAria.footer}
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link-muted"
            >
              {t.hero.github}
            </a>
            <a href="#about" className="text-link-muted">
              {t.footer.about}
            </a>
            <a href="#blog" className="text-link-muted">
              {t.footer.blog}
            </a>
          </nav>

          <p className="text-sm text-faint" translate="no">
            © {year} {t.profile.name}. {t.common.footerTech}
          </p>
        </div>
      </div>
    </footer>
  );
}
