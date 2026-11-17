"use client";

/**
 * 技能问答 Agent 的本地预览。
 *
 * 原项目是独立的 Vite 应用（React + sql.js WASM + pdf.js），产物放在
 * public/qa-agent/，这里用 iframe 内嵌，而不是把 3.2MB 的 wasm/pdf worker
 * 塞进本站 bundle。iframe 是独立文档，不受宿主主题变量 / snap-scroll 影响。
 *
 * GitHub Pages 下需要带 basePath（/astra-portfolio），本地 dev 为空。
 */
import "./SkillQaAgent.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function SkillQaAgent() {
  const src = `${BASE}/qa-agent/index.html`;

  return (
    <div className="skill-qa">
      <iframe
        className="skill-qa__frame"
        src={src}
        title="技能问答 Agent · Skill QA"
        loading="lazy"
        allow="clipboard-write"
        referrerPolicy="no-referrer"
      />
      <a
        className="skill-qa__open"
        href={src}
        target="_blank"
        rel="noopener noreferrer"
      >
        在新标签页打开完整应用 ↗
      </a>
    </div>
  );
}
