"use client";

import NavBar from "@/styles/classic/components/NavBar";
import ViewportSync from "@/components/ViewportSync";
import VantaBackground from "@/styles/classic/components/VantaBackgroundClient";
import HeroSection from "@/styles/classic/components/HeroSection";
import AboutSection from "@/styles/classic/components/AboutSection";
import SkillsSection from "@/styles/classic/components/SkillsSection";
import ProjectsSection from "@/styles/classic/components/ProjectsSection";
import BackToTop from "@/styles/classic/components/BackToTop";
import CookieConsent from "@/styles/classic/components/CookieConsent";
import BlogSection from "@/styles/classic/components/BlogSection";
import ExperienceSection from "@/styles/classic/components/ExperienceSection";
import FooterSection from "@/styles/classic/components/FooterSection";
import { useI18n } from "@/components/I18nProvider";
import { projects } from "@/data/projects";
import LabSection from "@/styles/shared/chrome/LabSection";

export default function ClassicHome() {
  const { t } = useI18n();

  return (
    <>
      <ViewportSync />
      <VantaBackground />
      <div className="relative z-10">
        <NavBar />
        <main id="main-content">
          <HeroSection />
          <AboutSection />
          {/* 单一「作品」区块：企业 + 开源已合并，旧 #enterprise / #github 保留别名锚点。 */}
          <ProjectsSection
            id="work"
            aliasIds={["enterprise", "github"]}
            sectionIndex={t.work.index}
            title={t.work.title}
            subtitle={t.work.subtitle}
            projects={projects}
            texts={t.work.projects}
            frosted
          />
          <LabSection style="classic" />
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
