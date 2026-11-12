import { COLORS, TEXT_STYLES, CONTENT_LEFT, sansStyle } from "../theme.js";

/**
 * 创建四列指标区，数值与说明一同参与复制施工。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createStatistics(scene) {
  // 保留原站演示指标与四等分布局，文案在此处可直接修改。
  scene.frame("stats", 1920, 2120, true);
  for (const x of [360, 640, 920]) scene.vertical(`s-div${x}`, x, 1920, 2120);
  scene.guide("g-stats", "y", 1960, 1930);
  scene.guide("g-stats-x", "x", CONTENT_LEFT, 1930);
  scene.text("st-n", CONTENT_LEFT, 1960, "10k+", TEXT_STYLES.stat, {
    snap: "g-stats",
  });
  scene.text("st-l", CONTENT_LEFT, 2028, "agents in a single swarm", TEXT_STYLES.body, {
    w: 220,
    snap: "g-stats-x",
  });
  scene.duplicate(
    "stats",
    ["st-n", "st-l"],
    [
      { dx: 280, dy: 0, edits: ["38ms", "median agent-to-agent handoff"] },
      {
        dx: 560,
        dy: 0,
        edits: ["99.99%", "orchestrator uptime, last 12 months"],
      },
      { dx: 840, dy: 0, edits: ["0", "tasks dropped last quarter"] },
    ]
  );
}

/**
 * 创建Define、Dispatch、Converge三步流程。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createWorkflow(scene) {
  // 网格竖线依赖中线完成，步骤文字保留与原站相同的对齐参考线。
  scene.frame("steps", 2120, 2640);
  scene.guide("g-steps", "x", CONTENT_LEFT, 2140);
  scene.guide("g-steps-c", "x", CONTENT_LEFT, 2330);
  scene.text(
    "p-title",
    CONTENT_LEFT,
    2194,
    "How a task moves\nthrough Swarm.",
    TEXT_STYLES.h2,
    { w: 640, snap: "g-steps", grow: true }
  );
  const middleRule = scene.horizontal("p-mid", 2320);
  scene.vertical("p-v1", 453, 2320, 2640, [middleRule]);
  scene.vertical("p-v2", 826, 2320, 2640, [middleRule]);
  scene.text(
    "ps-t",
    CONTENT_LEFT,
    2364,
    "Define",
    sansStyle(26, 600, 1.2, COLORS.ink, -0.02),
    { snap: "g-steps-c" }
  );
  scene.text(
    "ps-b",
    CONTENT_LEFT,
    2404,
    "Declare agents, skills and budgets in one file, versioned right next to your code.",
    TEXT_STYLES.body,
    { w: 296, snap: "g-steps-c" }
  );
  scene.duplicate(
    "steps",
    ["ps-t", "ps-b"],
    [
      {
        dx: 373,
        dy: 0,
        edits: [
          "Dispatch",
          "Swarm fans tasks out to the best agents and keeps every handoff ordered and observable.",
        ],
      },
      {
        dx: 746,
        dy: 0,
        edits: [
          "Converge",
          "Results stream back, get checked by supervisors, and land as one coherent change.",
        ],
      },
    ]
  );
}
