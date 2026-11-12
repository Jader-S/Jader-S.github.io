import type { StyleMode } from "@/styles/registry";
import type { Locale } from "@/lib/i18n";

export const PORTFOLIO_REPO_URL = "https://github.com/Jader-S/astra-portfolio";

const SKILL_BY_STYLE: Record<
  StyleMode,
  { slash: string; path: string; labelZh: string; labelEn: string }
> = {
  atelier: {
    slash: "/portfolio-atelier",
    path: ".cursor/skills/portfolio-atelier/SKILL.md",
    labelZh: "静奢（atelier）",
    labelEn: "Atelier",
  },
  classic: {
    slash: "/portfolio-classic",
    path: ".cursor/skills/portfolio-classic/SKILL.md",
    labelZh: "经典（classic）",
    labelEn: "Classic",
  },
  particle: {
    slash: "/portfolio-particle",
    path: "styles/particle",
    labelZh: "粒子（particle）",
    labelEn: "Particle",
  },
  blueprint: {
    slash: "/portfolio-blueprint",
    path: ".cursor/skills/portfolio-blueprint/SKILL.md",
    labelZh: "蓝图（blueprint）",
    labelEn: "Blueprint",
  },
  astra: {
    slash: "",
    path: "scripts/sync-astra.mjs",
    labelZh: "太空（ASTRA）",
    labelEn: "ASTRA",
  },
};

/** Prompt copied to clipboard for pasting into Cursor / other AI agents. */
export function buildSkillSharePrompt(style: StyleMode, locale: Locale): string {
  const skill = SKILL_BY_STYLE[style];

  if (locale === "en") {
    return [
      `Please scaffold my personal portfolio from this GitHub repo:`,
      PORTFOLIO_REPO_URL,
      ``,
      `Follow the Cursor skill in the repo: \`${skill.path}\` (or invoke \`${skill.slash}\` in Cursor).`,
      ``,
      `Requirements:`,
      `1. Clone the repo locally.`,
      `2. Confirm with me whether to keep the ${skill.labelEn} style (I can switch).`,
      `3. Before generating, ask whether I want to fill personal info now. For preview only, use root \`site-content.yaml\` placeholders and keep that file for later edits.`,
      `4. Keep only the chosen style package; remove the other style.`,
      `5. Apply placeholders or my answers, then \`npm install\` and \`npm run dev\`.`,
      `6. Optionally ask if I want help registering GitHub, pushing to my own repo, and deploying (GitHub Pages or Vercel). Skip deploy if I only need a local preview.`,
    ].join("\n");
  }

  return [
    `请根据这个 GitHub 仓库生成我的个人作品集：`,
    PORTFOLIO_REPO_URL,
    ``,
    `请遵循仓库内的 Cursor Skill：\`${skill.path}\`（或在 Cursor 对话使用 \`${skill.slash}\`）。`,
    ``,
    `要求：`,
    `1. 克隆该仓库到本地`,
    `2. 向我确认是否保留「${skill.labelZh}」风格（可改成另一套）`,
    `3. 生成前先问我要不要填写个人信息；若只想预览，使用根目录 site-content.yaml 占位，并保留该文件方便以后填写`,
    `4. 只保留选定风格，去掉另一套风格代码`,
    `5. 用占位或我提供的信息生成可运行项目，最后执行 npm install && npm run dev`,
    `6. 可选：再问我要不要教 GitHub 注册、提交到自己的仓库、部署上线（推荐 GitHub Pages，也可 Vercel）；如果我只要本地预览就跳过部署`,
  ].join("\n");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
