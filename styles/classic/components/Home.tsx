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
import { enterpriseProjects, githubProjects } from "@/data/projects";

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
          <SkillsSection />
          <ProjectsSection
            id="enterprise"
            sectionIndex={t.enterprise.index}
            title={t.enterprise.title}
            subtitle={t.enterprise.subtitle}
            projects={enterpriseProjects}
            texts={t.enterprise.projects}
            frosted
          />
          <ProjectsSection
            id="github"
            sectionIndex={t.github.index}
            title={t.github.title}
            subtitle={t.github.subtitle}
            projects={githubProjects}
            texts={t.github.projects}
            showLinks
          />
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
