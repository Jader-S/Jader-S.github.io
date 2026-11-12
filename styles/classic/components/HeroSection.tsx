"use client";

// import { CardOrbit, CardOrbitMobile } from "@fxshelf/card-orbit";
// import "@fxshelf/card-orbit/styles.css";
import { useI18n } from "@/components/I18nProvider";
import { profile } from "@/data/profile";
// import { ORBIT_IMAGES } from "@/lib/cardOrbit";

export default function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden px-4 pb-12 pt-24 sm:min-h-[88vh] sm:px-6 sm:pb-16 sm:pt-28 md:min-h-[92vh] lg:min-h-[100dvh] lg:items-stretch lg:pb-10 lg:pt-24">
      <div className="relative z-10 mx-auto w-full max-w-6xl lg:h-full lg:min-h-0 lg:flex lg:items-center xl:max-w-7xl">
        <div className="min-w-0 lg:py-4">
          <p
            className="animate-fade-in mb-5 font-mono text-xs tracking-[0.25em] text-theme-light uppercase"
            translate="no"
          >
            {t.hero.role}
          </p>

          <h1 className="animate-slide-up mb-4 text-3xl font-bold tracking-tight text-balance sm:mb-5 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="theme-text">{t.profile.name}</span>
          </h1>

          <p className="animate-slide-up animate-delay-100 mb-2 text-lg font-medium text-body sm:mb-3 sm:text-xl md:text-2xl">
            {t.profile.title}
          </p>

          <p className="animate-slide-up animate-delay-200 mb-6 max-w-xl text-sm leading-relaxed text-muted sm:mb-8 sm:text-base md:text-lg text-pretty">
            {t.profile.tagline}
          </p>

          <div className="animate-slide-up animate-delay-300 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#about" className="btn-primary">
              {t.hero.viewResume}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              {t.hero.github} →
            </a>
          </div>

          {/* <div className="animate-slide-up animate-delay-400 lg:hidden">
            <CardOrbitMobile images={ORBIT_IMAGES} />
          </div> */}
        </div>

        {/* <div className="relative hidden min-h-0 w-full items-center justify-center lg:flex lg:self-stretch">
          <CardOrbit
            images={ORBIT_IMAGES}
            style={{
              height: "min(68vh, 560px)",
              maxHeight: 560,
              maxWidth: "100%",
            }}
            ariaLabel="card-orbit preview"
          />
        </div> */}
      </div>

      <div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 motion-safe:animate-bounce md:block lg:bottom-8"
        aria-hidden="true"
      >
        <svg
          className="h-5 w-5 text-faint"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
