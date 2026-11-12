import { COLORS, TEXT_STYLES, CONTENT_LEFT, monoStyle } from "../theme.js";

/**
 * 创建首屏标题、操作按钮和四节点Agent调度图。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createHero(scene) {
  // 左侧文案与右侧流程图共用原站1280像素设计画布，移动端由外层等比缩放。
  scene.frame("hero", 88, 660);
  scene.vertical("hero-div", 740, 88, 660);
  scene.guide("g-hero", "x", CONTENT_LEFT, 120);
  scene.guide("g-hero-r", "x", 776, 120);
  scene.text(
    "h-title",
    CONTENT_LEFT,
    192,
    "Run a thousand\nagents as one.",
    TEXT_STYLES.h1,
    {
      w: 580,
      snap: "g-hero",
      grow: true,
    }
  );
  scene.text(
    "h-lead",
    CONTENT_LEFT,
    356,
    "Swarm schedules, routes and supervises AI agents across your stack, and runs their work in parallel.",
    TEXT_STYLES.lead,
    { w: 500, snap: "g-hero" }
  );
  scene.rect("h-btn1", CONTENT_LEFT, 488, 184, 48, { r: 8, fill: COLORS.ink });
  scene.text("h-btn1-t", CONTENT_LEFT, 501, "Start building", TEXT_STYLES.btn, {
    w: 184,
    align: "center",
    deps: ["r:h-btn1"],
  });
  scene.rect("h-btn2", CONTENT_LEFT + 196, 488, 156, 48, {
    r: 8,
    fill: COLORS.card,
    stroke: COLORS.line,
  });
  scene.text(
    "h-btn2-t",
    CONTENT_LEFT + 196,
    501,
    "Read the docs",
    TEXT_STYLES.btnDark,
    {
      w: 156,
      align: "center",
      deps: ["r:h-btn2"],
    }
  );
  scene.rect("g-disp", 776, 162, 388, 64, { r: 10, fill: COLORS.ink });
  scene.text("g-disp-t", 800, 172, "swarm.dispatch(task)", TEXT_STYLES.nodeWhite, {
    deps: ["r:g-disp"],
  });
  scene.text(
    "g-disp-s",
    800,
    194,
    "orchestrator · 18 tasks queued",
    monoStyle(12, "#8F949B"),
    { deps: ["r:g-disp"] }
  );
  const stemTask = scene.path(
    "g-stem",
    [
      { x: 970, y: 226 },
      { x: 970, y: 258 },
    ],
    {
      stroke: "#9DA2A9",
      deps: ["r:g-disp"],
    }
  );
  scene.path(
    "g-bus",
    [
      { x: 866, y: 290 },
      { x: 866, y: 258 },
      { x: 1074, y: 258 },
      { x: 1074, y: 290 },
    ],
    {
      stroke: "#9DA2A9",
      deps: [stemTask],
    }
  );
  scene.rect("w0", 776, 290, 180, 64, {
    r: 10,
    fill: COLORS.card,
    stroke: COLORS.line,
  });
  scene.text("w0-n", 796, 301, "agent/research", TEXT_STYLES.nodeName, {
    deps: ["r:w0"],
  });
  scene.text("w0-s", 796, 323, "● 12 replicas", monoStyle(12, COLORS.accent), {
    deps: ["r:w0"],
  });
  scene.duplicate(
    "workers",
    ["w0", "w0-n", "w0-s"],
    [
      { dx: 208, dy: 0, edits: ["agent/writer", "● 4 replicas"] },
      { dx: 0, dy: 104, edits: ["agent/review", "● 2 replicas"] },
      { dx: 208, dy: 104, edits: ["agent/deploy", "○ waiting"] },
    ]
  );
  // 下排连线等待卡片复制完成，防止连线在目标卡片出现前独自落下。
  scene.path(
    "g-l1",
    [
      { x: 866, y: 354 },
      { x: 866, y: 394 },
    ],
    { stroke: "#9DA2A9", deps: ["d:workers:2"] }
  );
  scene.path(
    "g-l2",
    [
      { x: 1074, y: 354 },
      { x: 1074, y: 394 },
    ],
    { stroke: "#9DA2A9", deps: ["d:workers:2"] }
  );
  scene.rect("g-track", 776, 540, 388, 6, { r: 3, fill: "#E1E3E6" });
  scene.rect("g-fill", 776, 540, 252, 6, {
    r: 3,
    fill: COLORS.accent,
    deps: ["r:g-track"],
  });
  scene.text(
    "g-stat",
    776,
    562,
    "4 agents · 18 tasks in flight · 0 conflicts",
    TEXT_STYLES.small,
    { snap: "g-hero-r" }
  );
}

/**
 * 创建首屏下方的团队名称条，保留原站网格和复制效果。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createTeamStrip(scene) {
  // 名称列表可以直接编辑，首项负责原稿施工，余项由光标复制并替换文字。
  const names = ["Halcyon", "Parallax", "Meridian", "Kestrel"];
  scene.frame("logos", 660, 772, true);
  scene.text("l-label", CONTENT_LEFT, 699, "Used by teams at", TEXT_STYLES.small, {
    w: 230,
  });
  for (let index = 0; index < 5; index++)
    scene.vertical(`l-div${index}`, 360 + index * 168, 660, 772);
  scene.text("logo0", 388, 703, "Northwind", TEXT_STYLES.logo);
  scene.duplicate(
    "logos",
    ["logo0"],
    names.map((name, index) => ({
      dx: 168 * (index + 1),
      dy: 0,
      edits: [name],
    }))
  );
}
