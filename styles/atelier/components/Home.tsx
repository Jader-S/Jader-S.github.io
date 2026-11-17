"use client";

import NavBar from "@/styles/atelier/components/NavBar";
import ViewportSync from "@/components/ViewportSync";
import PointerAura from "@/styles/atelier/components/PointerAura";
import PageDroplets from "@/styles/atelier/components/PageDroplets";
import HeroSection from "@/styles/atelier/components/HeroSection";
import AboutSection from "@/styles/atelier/components/AboutSection";
import SkillsSection from "@/styles/atelier/components/SkillsSection";
import SelectedProjects from "@/styles/atelier/components/SelectedProjects";
import BackToTop from "@/styles/atelier/components/BackToTop";
import CookieConsent from "@/styles/atelier/components/CookieConsent";
import BlogSection from "@/styles/atelier/components/BlogSection";
import ExperienceSection from "@/styles/atelier/components/ExperienceSection";
import FooterSection from "@/styles/atelier/components/FooterSection";
import LabSection from "@/styles/shared/chrome/LabSection";

export default function AtelierHome() {
  return (
    <>
      <ViewportSync />
      <div className="page-noise fixed inset-0 z-[1]" aria-hidden="true" />
      <PointerAura />
      <PageDroplets />
      <div className="relative z-10">
        <NavBar />
        <main id="main-content" tabIndex={-1}>
          <HeroSection />
          <AboutSection />
          {/* 单一「作品」区块：企业项目与开源项目已合并，别名锚点保留在段内。 */}
          <SelectedProjects />
          <LabSection style="atelier" />
          <SkillsSection />
          <BlogSection />
          <ExperienceSection />
        </main>
        <FooterSection />
        <BackToTop />
        <CookieConsent />
      </div>
    </>
  );
}
