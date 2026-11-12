"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import ViewportSync from "@/components/ViewportSync";
import { useViewport } from "@/lib/hooks/useViewport";
import { resolveSectionAsset, type ParticleSectionId } from "@/styles/particle/assets";
import AboutSection from "@/styles/particle/components/AboutSection";
import BlogSection from "@/styles/particle/components/BlogSection";
import ExperienceSection from "@/styles/particle/components/ExperienceSection";
import FooterSection from "@/styles/particle/components/FooterSection";
import BackToTop from "@/styles/particle/components/BackToTop";
import CookieConsent from "@/styles/particle/components/CookieConsent";
import HeroSection from "@/styles/particle/components/HeroSection";
import NavBar from "@/styles/particle/components/NavBar";
import ParticleStage, {
  usePrefersReducedMotion,
} from "@/styles/particle/components/ParticleStage";
import SkillsSection from "@/styles/particle/components/SkillsSection";
import {
  scrollColumnToSection,
  useSectionObserver,
  useSnapScrollController,
} from "@/styles/particle/components/SnapScrollController";
import WorkSection from "@/styles/particle/components/WorkSection";

export default function ParticleHome() {
  const columnRef = useRef<HTMLDivElement>(null);
  const { viewport } = useViewport();
  const isDesktop = viewport === "desktop";
  const reducedMotion = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState<ParticleSectionId>("top");
  const [assetUrl, setAssetUrl] = useState(() => resolveSectionAsset("top"));
  const [busy, setBusy] = useState(false);

  const snapEnabled = isDesktop && !reducedMotion;
  const locked = snapEnabled && busy;

  const onSectionChange = useCallback((id: ParticleSectionId) => {
    setActiveId((prev) => {
      if (prev === id) return prev;
      setAssetUrl((current) => resolveSectionAsset(id, current));
      return id;
    });
  }, []);

  const navigateTo = useCallback(
    (id: ParticleSectionId) => {
      if (locked) return;
      const root = columnRef.current;
      if (root && snapEnabled) {
        void scrollColumnToSection(root, id);
      } else {
        document.getElementById(id)?.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }
      onSectionChange(id);
    },
    [locked, onSectionChange, snapEnabled]
  );

  useSnapScrollController({
    columnRef,
    enabled: snapEnabled,
    locked,
    activeId,
    onSectionChange,
  });

  useSectionObserver(!snapEnabled, onSectionChange);

  const stageEnabled = useMemo(
    () => isDesktop && !reducedMotion,
    [isDesktop, reducedMotion]
  );

  return (
    <>
      <ViewportSync />
      <div className="particle-shell">
        {/* Full-viewport particle field; content scrolls above on a soft scrim. */}
        <ParticleStage
          assetUrl={assetUrl}
          enabled={stageEnabled}
          reducedMotion={reducedMotion || !isDesktop}
          lockScroll={locked}
          onBusyChange={setBusy}
        />

        <div
          ref={columnRef}
          className={snapEnabled ? "particle-snap-column" : "particle-column"}
        >
          <NavBar activeId={activeId} onNavigate={navigateTo} locked={locked} />
          <main id="main-content">
            <HeroSection />
            <AboutSection />
            <WorkSection />
            <SkillsSection />
            <BlogSection />
            <ExperienceSection />
          </main>
          <FooterSection />
        </div>
        <BackToTop scrollRootRef={columnRef} />
        <CookieConsent />
      </div>
    </>
  );
}
