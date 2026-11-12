import { TEXT_STYLES, CONTENT_LEFT } from "../theme.js";

/** 六项能力的文案与网格偏移，修改此处即可更新卡片内容。 */
const featureCopies = [
  {
    dx: 373,
    dy: 0,
    edits: [
      "Shared memory",
      "Agents read and write one consistent context, so nobody does the same work twice.",
    ],
  },
  {
    dx: 746,
    dy: 0,
    edits: [
      "Supervisors",
      "Retry, escalate or hand off automatically when an agent gets stuck or drifts.",
    ],
  },
  {
    dx: 0,
    dy: 240,
    edits: [
      "Fan-out, fan-in",
      "Split big jobs across hundreds of workers and merge the results deterministically.",
    ],
  },
  {
    dx: 373,
    dy: 240,
    edits: [
      "Live traces",
      "Watch every decision as it happens, with replays down to a single tool call.",
    ],
  },
  {
    dx: 746,
    dy: 240,
    edits: [
      "Guardrails",
      "Budgets, approvals and policies that every agent in the swarm respects by default.",
    ],
  },
];

/**
 * 创建能力介绍和三列两行功能网格。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createFeatures(scene) {
  // 标题区和功能区独立设置参考线，滚动时分别触发施工。
  scene.frame("fhead", 772, 960);
  scene.guide("g-feat", "x", CONTENT_LEFT, 790);
  scene.guide("g-feat-r", "x", 760, 790);
  scene.text(
    "f-title",
    CONTENT_LEFT,
    834,
    "Built for running agents\nin production.",
    TEXT_STYLES.h2,
    { w: 580, snap: "g-feat", grow: true }
  );
  scene.text(
    "f-lead",
    760,
    840,
    "Routing, memory, supervision, fan-out, tracing and guardrails all come with the orchestrator.",
    TEXT_STYLES.body,
    { w: 380, snap: "g-feat-r" }
  );
  scene.frame("fgrid", 960, 1440, true);
  scene.horizontal("f-mid", 1200);
  scene.vertical("f-v1", 453, 960, 1440);
  scene.vertical("f-v2", 826, 960, 1440);
  scene.guide("g-cell", "x", CONTENT_LEFT, 975);
  scene.guide("g-cell-y", "y", 1000, 975);
  scene.text("fc-title", CONTENT_LEFT, 1000, "Smart routing", TEXT_STYLES.h3, {
    snap: "g-cell-y",
  });
  scene.text(
    "fc-body",
    CONTENT_LEFT,
    1036,
    "Send every task to the agent best equipped for it, based on skills, cost and live load.",
    TEXT_STYLES.body,
    { w: 296, snap: "g-cell" }
  );
  scene.duplicate("features", ["fc-title", "fc-body"], featureCopies);
}
