"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";
import { blogPosts, csdnProfile } from "@/data/blogs";
import { experienceDomains, type ExperienceDomainId } from "@/data/experience";
import { profile } from "@/data/profile";
import {
  enterpriseProjects,
  githubProjects,
  type EnterpriseProjectId,
  type GithubProjectId,
} from "@/data/projects";
import { skillCategories, type SkillCategoryId } from "@/data/skills";
import { ActionType } from "@/styles/blueprint/swarm/interactions/actions.js";
import { createPortfolioInteractions } from "@/styles/blueprint/swarm/interactions/portfolio-actions.js";
import { createPortfolioSceneFactory } from "@/styles/blueprint/swarm/scene/create-portfolio-scene.js";
import { SwarmExperience } from "@/styles/blueprint/swarm/SwarmExperience.jsx";
import LocaleToggle from "@/styles/shared/chrome/LocaleToggle";
import SkillShareRail from "@/styles/shared/chrome/SkillShareRail";
import StyleRail from "@/styles/shared/chrome/StyleRail";
import ThemeToggle from "@/styles/shared/chrome/ThemeToggle";
import "@/styles/blueprint/swarm/styles/index.css";

interface BuildPhaseProps {
  replayKey: number;
}

export default function BuildPhase({ replayKey }: BuildPhaseProps) {
  const { t, locale } = useI18n();
  const { resolved } = useTheme();
  const [started, setStarted] = useState(false);
  const engineRef = useRef<{ started?: boolean } | null>(null);

  const sceneCopy = useMemo(() => {
    const navItems = t.nav.filter((item) =>
      ["#about", "#work", "#skills", "#blog", "#experience"].includes(item.href)
    );
    const projects = [
      ...enterpriseProjects.slice(0, 3).map((project) => {
        const id = project.id as EnterpriseProjectId;
        return {
          title: t.enterprise.projects[id].name,
          body: t.enterprise.projects[id].description,
        };
      }),
      ...githubProjects.slice(0, 3).map((project) => {
        const id = project.id as GithubProjectId;
        return {
          title: t.github.projects[id].name,
          body: t.github.projects[id].description,
        };
      }),
    ];
    const skills = skillCategories.slice(0, 6).map((category) => {
      const id = category.id as SkillCategoryId;
      const categoryCopy = t.skills.categories[id];
      return {
        title: categoryCopy.name,
        body: category.skillIds
          .slice(0, 4)
          .map((skillId) => (categoryCopy.skills as Record<string, string>)[skillId])
          .join(" · "),
      };
    });
    const posts = blogPosts.slice(0, 4).map((post) => ({
      title: post.title,
      meta: `${post.date} · ${post.likes}`,
      href: post.url,
    }));
    const domains = experienceDomains.map((domain) => {
      const id = domain.id as ExperienceDomainId;
      return {
        title: t.experience.domains[id].title,
        body: t.experience.domains[id].description,
      };
    });

    return {
      name: t.profile.name,
      title: t.profile.title,
      tagline: t.profile.tagline,
      kicker: t.hero.role,
      github: t.hero.github,
      primaryCta: t.about.title,
      diagramNote: "React · Vue · TypeScript · AI",
      highlights: t.profile.highlights,
      nav: { brand: t.profile.name, items: navItems.map((item) => item.label) },
      about: {
        index: t.about.index,
        title: t.about.title,
        subtitle: t.about.subtitle,
        paragraphs: t.about.summary,
      },
      work: {
        index: t.enterprise.index,
        title: t.enterprise.title,
        subtitle: t.enterprise.subtitle,
        items: projects,
      },
      skills: {
        index: t.skills.index,
        title: t.skills.title,
        subtitle: t.skills.subtitle,
        items: skills,
      },
      blog: {
        index: t.blog.index,
        title: t.blog.title,
        subtitle: t.blog.subtitle,
        posts,
      },
      experience: {
        index: t.experience.index,
        title: t.experience.title,
        subtitle: t.experience.subtitle,
        items: domains,
      },
      signTitle: t.blueprint.signTitle,
      builtBy: t.blueprint.builtBy,
      palette: resolved,
      footer: `© ${new Date().getFullYear()} ${t.profile.name}. ${t.common.footerTech}`,
      links: [
        { id: "github", label: t.hero.github, kind: "github" },
        { id: "csdn", label: t.footer.csdn, kind: "open", href: csdnProfile },
        { id: "about", label: t.footer.about, kind: "scroll", target: "a-title" },
        { id: "blog", label: t.footer.blog, kind: "scroll", target: "b-title" },
      ],
    };
  }, [resolved, t]);

  const sceneFactory = useMemo(
    () => createPortfolioSceneFactory(sceneCopy),
    [sceneCopy]
  );
  const interactions = useMemo(
    () =>
      createPortfolioInteractions({
        nav: sceneCopy.nav.items,
        primaryCta: sceneCopy.primaryCta,
        github: sceneCopy.github,
        posts: sceneCopy.blog.posts,
        links: sceneCopy.links,
      }),
    [sceneCopy]
  );

  useEffect(() => {
    setStarted(false);
    let frame = 0;
    const watch = () => {
      if (engineRef.current?.started) {
        setStarted(true);
        return;
      }
      frame = requestAnimationFrame(watch);
    };
    frame = requestAnimationFrame(watch);
    return () => cancelAnimationFrame(frame);
  }, [replayKey, locale, resolved]);

  const onAction = useCallback((action: object) => {
    const next = action as { type?: string; id?: string; href?: string };
    if (next.type !== ActionType.CUSTOM) return false;
    if (next.id === "github") {
      window.open(profile.github, "_blank", "noopener,noreferrer");
      return true;
    }
    if ((next.id === "open" || next.id === "csdn") && next.href) {
      window.open(next.href, "_blank", "noopener,noreferrer");
      return true;
    }
    return false;
  }, []);

  return (
    <div className="blueprint-shell relative min-h-[100dvh]">
      <SwarmExperience
        key={`${replayKey}-${locale}-${resolved}`}
        sceneFactory={sceneFactory}
        interactions={interactions}
        onAction={onAction}
        autoStart={false}
        navLabel={t.navAria.main}
        onEngine={(engine) => {
          engineRef.current = engine as { started?: boolean } | null;
        }}
      />
      <div className="pointer-events-auto fixed right-3 top-7 z-[80] flex items-center gap-2 sm:right-4">
        <LocaleToggle compact />
        <ThemeToggle compact />
      </div>
      <StyleRail />
      <SkillShareRail />
      <p
        className={`pointer-events-none fixed bottom-4 left-4 z-[70] max-w-xs font-mono text-[11px] tracking-wide text-faint transition-opacity sm:bottom-5 sm:left-5 ${started ? "opacity-0" : "opacity-100"}`}
      >
        {t.blueprint.startHint}
      </p>
    </div>
  );
}
