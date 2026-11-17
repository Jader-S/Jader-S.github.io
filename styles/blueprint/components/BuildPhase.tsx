"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";
import { blogPosts, getRecentPosts } from "@/data/blogs";
import { openBlog, openBlogIndex } from "@/lib/blog-modal";
import { demoCatalog, type DemoSlug, type ProjectId } from "@/data/project-details";
import { experienceDomains, type ExperienceDomainId } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillCategories, type SkillCategoryId } from "@/data/skills";
import { openDemo, openDemoIndex, openProject } from "@/lib/project-modal";
import { ActionType } from "@/styles/blueprint/swarm/interactions/actions.js";
import { createPortfolioInteractions } from "@/styles/blueprint/swarm/interactions/portfolio-actions.js";
import { createPortfolioSceneFactory } from "@/styles/blueprint/swarm/scene/create-portfolio-scene.js";
import { SwarmExperience } from "@/styles/blueprint/swarm/SwarmExperience.jsx";
import LabButton from "@/styles/shared/chrome/LabButton";
import BlogButton from "@/styles/shared/chrome/BlogButton";
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
      ["#about", "#work", "#lab", "#skills", "#blog", "#experience"].includes(item.href)
    );
    const workItems = projects.map((project) => ({
      id: project.id as ProjectId,
      title: t.work.projects[project.id].name,
      body: t.work.projects[project.id].description,
    }));
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
    // 蓝图画布只放得下 4 行：动态取全站最新的 4 篇，不再锁死某个主题的旧文章。
    // 完整 18 篇由工具栏的「全部日志」入口打开。
    const posts = getRecentPosts(4).map((post) => ({
      title: post.title,
      meta: post.date,
      slug: post.slug,
    }));
    const domains = experienceDomains.map((domain) => {
      const id = domain.id as ExperienceDomainId;
      return {
        title: t.experience.domains[id].title,
        body: t.experience.domains[id].description,
      };
    });

    // 实验室：平铺全部 Demo，卡片点击在当前页打开对应 Demo（与作品卡片同构）。
    const demos = demoCatalog.map((demo) => ({
      title: demo.title[locale],
      body: demo.desc[locale],
      slug: demo.slug,
    }));

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
        index: t.work.index,
        title: t.work.title,
        subtitle: t.work.subtitle,
        items: workItems,
      },
      lab: {
        index: t.lab.index,
        title: t.lab.title,
        subtitle: t.lab.subtitle,
        items: demos,
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
        allPostsLabel: `${t.blog.allPosts} · ${t.blog.postCount(blogPosts.length)} →`,
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
        { id: "about", label: t.footer.about, kind: "scroll", target: "a-title" },
        { id: "blog", label: t.footer.blog, kind: "scroll", target: "b-title" },
      ],
    };
  }, [resolved, t, locale]);

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
        allPostsLabel: sceneCopy.blog.allPostsLabel,
        projects: sceneCopy.work.items,
        demos: sceneCopy.lab.items,
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
    const next = action as {
      type?: string;
      id?: string;
      slug?: string;
      projectId?: ProjectId;
      href?: string;
    };
    if (next.type !== ActionType.CUSTOM) return false;
    if (next.id === "github") {
      window.open(profile.github, "_blank", "noopener,noreferrer");
      return true;
    }
    if (next.id === "repo" && next.href) {
      // GitHub repo cards keep the external link in a new tab.
      window.open(next.href, "_blank", "noopener,noreferrer");
      return true;
    }
    if (next.id === "lab") {
      // 绘制页已含独立的 #lab 段（画布模块），导航走 SCROLL，这里仅作兜底。
      openDemoIndex();
      return true;
    }
    if (next.id === "demo" && next.slug) {
      // 实验室卡片在当前页打开对应 Demo，返回直接关弹框、落回画布。
      openDemo(next.slug as DemoSlug, { kind: "lab" });
      return true;
    }
    if (next.id === "project" && next.projectId) {
      // Work cards open the shared detail modal in this page.
      openProject(next.projectId);
      return true;
    }
    if (next.id === "open" && next.slug) {
      // Blog posts open in an in-page modal, no route and no new tab.
      openBlog(next.slug);
      return true;
    }
    if (next.id === "allPosts") {
      // 画布博客区的「全部日志」入口：打开完整列表，与其他主题同构。
      openBlogIndex();
      return true;
    }
    return false;
  }, []);

  return (
    <div
      className="blueprint-shell relative min-h-[100dvh]"
      id="main-content"
      tabIndex={-1}
    >
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
        <BlogButton compact />
        <LabButton compact />
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
