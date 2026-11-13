import type { ProjectId } from "@/data/projects";
import type { CategorySkillIds, SkillCategoryId } from "@/data/skills";
import type { ExperienceDomainId } from "@/data/experience";

export type Locale = "zh" | "en";

export interface NavItem {
  href: string;
  label: string;
}

export interface HighlightItem {
  label: string;
  value: string;
}

/** 项目中英文文案（按 data/projects.ts 中的 id 索引） */
export interface ProjectText {
  name: string;
  description: string;
}

/** 经验领域中英文文案（按 data/experience.ts 中的 id 索引） */
export interface ExperienceDomainText {
  title: string;
  description: string;
}

/**
 * 技能分类中英文文案（按 data/skills.ts 中的 id 索引）。
 * 用 mapped type 与 data 绑定：data 里每个分类 id 及其技能 id
 * 都必须在 zh / en 两份文案中存在，漏写会编译报错。
 */
export type SkillCategoriesText = {
  [C in SkillCategoryId]: {
    name: string;
    skills: Record<CategorySkillIds<C>, string>;
  };
};

export interface LocaleMessages {
  meta: {
    title: string;
    description: string;
  };
  common: {
    skipLink: string;
    backToTop: string;
    viewRepo: string;
    readMore: string;
    featured: string;
    hot: string;
    visitGithub: string;
    yearsExp: string;
    yearsExpShort: string;
    footerTech: string;
  };
  /** 4 主题共用的统一导航（#top 走品牌链接，不占导航项）。 */
  nav: NavItem[];
  navAria: {
    main: string;
    footer: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    role: string;
    viewResume: string;
    github: string;
  };
  profile: {
    name: string;
    title: string;
    tagline: string;
    highlights: HighlightItem[];
  };
  about: {
    index: string;
    title: string;
    subtitle: string;
    headline: string;
    headlineHighlight: string;
    headlineEnd: string;
    location: string;
    summary: string[];
  };
  skills: {
    index: string;
    title: string;
    subtitle: string;
    featuredDesc: string;
    categories: SkillCategoriesText;
  };
  /** 单一「作品」区块：企业项目 + 开源项目已合并，不再分区（Phase 7）。 */
  work: {
    index: string;
    title: string;
    subtitle: string;
    /** 作品文案查找表，key 与 data/projects.ts 的 projects id 一致 */
    projects: Record<ProjectId, ProjectText>;
  };
  blog: {
    index: string;
    title: string;
    subtitle: string;
    allPosts: string;
    close: string;
    notFound: string;
    emptyBody: string;
    postCount: (count: number) => string;
  };
  experience: {
    index: string;
    title: string;
    subtitle: string;
    /** 领域文案查找表，key 与 data/experience.ts 的 id 一致 */
    domains: Record<ExperienceDomainId, ExperienceDomainText>;
  };
  footer: {
    about: string;
    blog: string;
  };
  cookie: {
    title: string;
    description: string;
    accept: string;
    reject: string;
  };
  theme: {
    light: string;
    dark: string;
    auto: string;
    ariaLabel: string;
  };
  style: {
    atelier: string;
    classic: string;
    particle: string;
    blueprint: string;
    astra: string;
    ariaLabel: string;
    railLabel: string;
    drawerTitle: string;
    openMenu: string;
    closeMenu: string;
    current: string;
  };
  skillShare: {
    ariaLabel: string;
    label: string;
    hint: string;
    tooltipTitle: string;
    tooltipDoneHint: string;
    copied: string;
    copyFailed: string;
  };
  blueprint: {
    replayBuild: string;
    startHint: string;
    builtBy: string;
    signTitle: string;
  };
  locale: {
    zh: string;
    en: string;
  };
}
