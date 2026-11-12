import { COLORS, TEXT_STYLES, CONTENT_LEFT, monoStyle } from "../theme.js";
import { measureText } from "../text-metrics.js";

/** 页面中展示的示例配置；每行独立施工，缩进和行顺序保持可编辑。 */
export const CONFIGURATION_LINES = [
  "# swarm.yaml",
  "swarm: launch-week",
  "agents:",
  "  research: { model: fast, replicas: 12 }",
  "  writer:   { model: smart, replicas: 4 }",
  "  reviewer: { model: smart, replicas: 2 }",
  "routing:",
  "  strategy: skills-first",
  "  fallback: reviewer",
  "budget:",
  "  max_spend: $40/day",
  "  on_exceed: pause",
];

/**
 * 创建配置说明和右侧深色代码窗口。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createConfiguration(scene) {
  // 窗口先完成底板施工，按钮、分隔线和代码行再依次进入任务队列。
  scene.frame("code", 1440, 1920);
  scene.vertical("c-div", 600, 1440, 1920);
  scene.guide("g-code", "x", CONTENT_LEFT, 1460);
  scene.guide("g-code-y", "y", 1772, 1600);
  scene.text(
    "c-title",
    CONTENT_LEFT,
    1522,
    "One file describes\nthe whole swarm.",
    TEXT_STYLES.h2,
    { w: 440, snap: "g-code", grow: true }
  );
  scene.text(
    "c-body",
    CONTENT_LEFT,
    1630,
    "One declarative file sets your agents, how work is routed between them, and what they’re allowed to spend. Review it in a pull request like any other code.",
    TEXT_STYLES.body,
    { w: 400, snap: "g-code" }
  );
  scene.text(
    "c-link",
    CONTENT_LEFT,
    1772,
    "Read the spec",
    monoStyle(13, COLORS.ink, 500),
    { snap: "g-code-y" }
  );
  const windowTask = scene.rect("c-win", 640, 1488, 520, 384, {
    r: 12,
    fill: COLORS.code,
  });
  for (let index = 0; index < 3; index++) {
    scene.rect(`c-dot${index}`, 664 + index * 18, 1507, 10, 10, {
      r: 5,
      fill: "#30343A",
      deps: [windowTask],
    });
  }
  const fileName = "swarm.yaml";
  scene.text(
    "c-file",
    1136 - measureText(fileName, TEXT_STYLES.codeDim, TEXT_STYLES.codeDim.size).w,
    1503,
    fileName,
    TEXT_STYLES.codeDim,
    { deps: [windowTask] }
  );
  scene.path(
    "c-sep",
    [
      { x: 640, y: 1536 },
      { x: 1160, y: 1536 },
    ],
    { stroke: "#25282D", deps: [windowTask] }
  );
  CONFIGURATION_LINES.forEach((line, index) => {
    scene.text(`c-ln${index}`, 664, 1556 + index * 23, line, TEXT_STYLES.code, {
      deps: [windowTask],
    });
  });
}
