"use client";

import AboutSection from "@/styles/blueprint/components/AboutSection";
import BackToTop from "@/styles/blueprint/components/BackToTop";
import BlogSection from "@/styles/blueprint/components/BlogSection";
import CookieConsent from "@/styles/blueprint/components/CookieConsent";
import ExperienceSection from "@/styles/blueprint/components/ExperienceSection";
import FooterSection from "@/styles/blueprint/components/FooterSection";
import HeroSection from "@/styles/blueprint/components/HeroSection";
import NavBar from "@/styles/blueprint/components/NavBar";
import SkillsSection from "@/styles/blueprint/components/SkillsSection";
import WorkSection from "@/styles/blueprint/components/WorkSection";
import SkillShareRail from "@/styles/shared/chrome/SkillShareRail";
import StyleRail from "@/styles/shared/chrome/StyleRail";

interface SettledHomeProps {
  onReplay: () => void;
}

export default function SettledHome({ onReplay }: SettledHomeProps) {
  return (
    <div className="blueprint-shell blueprint-grid">
      <NavBar />
      <main id="main-content">
        <HeroSection onReplay={onReplay} />
        <AboutSection />
        <WorkSection />
        <SkillsSection />
        <BlogSection />
        <ExperienceSection />
      </main>
      <FooterSection />
      <BackToTop />
      <CookieConsent />
      <StyleRail />
      <SkillShareRail />
    </div>
  );
}
