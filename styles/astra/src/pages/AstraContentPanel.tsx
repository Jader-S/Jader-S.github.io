"use client";

/**
 * 2D 详情层编排（替代原 react-router <Routes>）。
 *
 * /astra 是单路由：行星切换走 flightMachine 状态机（requestFlyTo），
 * 这里根据 store 的 activePlanet 渲染对应的 2D 内容面板，叠在 3D Canvas 之上。
 * - home（activePlanet === null）：HomePage hero 叠加层（pointer-events:none，不挡 3D）
 * - about / projects / demos / contact：对应详情页（内容走 ASTRA 内部 i18n，Phase 3 统一进 data/i18n）
 * - projects 下钻：局部 selectedProjectId 状态，列表 → 详情 → 返回列表
 * - blog：Phase 2 才迁入 MDX，此处先给占位面板
 */
import { useEffect, useState } from "react";
import { useStore } from "@astra/state/useStore";
import AboutPage from "./AboutPage";
import ProjectsPage from "./ProjectsPage";
import ProjectDetailPage from "./ProjectDetailPage";
import DemosPage from "./DemosPage";
import ContactPage from "./ContactPage";
import HomePage from "./HomePage";

export default function AstraContentPanel() {
  const activePlanet = useStore((s) => s.activePlanet);
  const [projectId, setProjectId] = useState<string | null>(null);

  // 离开 projects 星球时清空 drill-down 选择，避免下次进入还停在详情
  useEffect(() => {
    if (activePlanet !== "projects") setProjectId(null);
  }, [activePlanet]);

  // 母星（星系全景）时 activePlanet 为 null
  const view = activePlanet ?? "home";

  if (view === "home") return <HomePage />;
  if (view === "about") return <AboutPage />;
  if (view === "projects") {
    return projectId ? (
      <ProjectDetailPage id={projectId} onBack={() => setProjectId(null)} />
    ) : (
      <ProjectsPage onOpenProject={(id) => setProjectId(id)} />
    );
  }
  if (view === "demos") return <DemosPage />;
  if (view === "contact") return <ContactPage />;
  return null;
}
