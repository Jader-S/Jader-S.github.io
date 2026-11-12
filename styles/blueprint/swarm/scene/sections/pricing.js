import { COLORS, TEXT_STYLES, CONTENT_LEFT, sansStyle } from "../theme.js";

/** 付费方案文案依次对应名称、价格、周期、说明、三项权益与按钮。 */
const planCopies = [
  {
    dx: 355,
    dy: 0,
    edits: [
      "Colony",
      "$49",
      "per month, billed monthly",
      "For teams running agents in production, every day.",
      "✓  Up to 500 agents",
      "✓  Shared memory + supervisors",
      "✓  30-day trace history",
      "Get Colony",
    ],
  },
  {
    dx: 710,
    dy: 0,
    edits: [
      "Swarm",
      "Let’s talk",
      "annual contract",
      "For fleets that never sleep and never stop shipping.",
      "✓  Unlimited agents",
      "✓  SSO, audit logs, VPC",
      "✓  Dedicated orchestrator",
      "Contact sales",
    ],
  },
];

/**
 * 创建三档定价卡片，保留先制作免费卡片、再复制与替换文字的完整过程。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createPricing(scene) {
  // 样式、尺寸与原站保持相同，卡片间距与文案数组独立可编辑。
  scene.frame("pricing", 2640, 3280, true);
  scene.guide("g-price", "x", CONTENT_LEFT, 2660);
  scene.guide("g-price-r", "x", 760, 2660);
  scene.guide("g-plan", "x", 144, 2860);
  scene.text(
    "$-title",
    CONTENT_LEFT,
    2714,
    "Priced by the size\nof your swarm.",
    TEXT_STYLES.h2,
    { w: 520, snap: "g-price", grow: true }
  );
  scene.text(
    "$-lead",
    760,
    2730,
    "Every plan includes the full orchestrator. You only pay more when your swarm gets bigger.",
    TEXT_STYLES.body,
    { w: 380, snap: "g-price-r" }
  );
  const cardTask = scene.rect("pc", 116, 2850, 330, 398, {
    r: 14,
    fill: COLORS.card,
    stroke: COLORS.line,
  });
  const cardDependencies = [cardTask];
  scene.text("pc-name", 144, 2878, "Hive", sansStyle(16, 600, 1.3), {
    deps: cardDependencies,
    snap: "g-plan",
  });
  scene.text("pc-price", 144, 2912, "$0", TEXT_STYLES.price, {
    deps: cardDependencies,
    snap: "g-plan",
  });
  scene.text("pc-per", 144, 2966, "free forever", TEXT_STYLES.small, {
    deps: cardDependencies,
  });
  scene.text(
    "pc-desc",
    144,
    3000,
    "For tinkering with your first swarm on a weekend.",
    TEXT_STYLES.body,
    { w: 274, deps: cardDependencies, snap: "g-plan" }
  );
  scene.rect("pc-rule", 144, 3070, 274, 1, {
    fill: COLORS.line,
    deps: cardDependencies,
  });
  scene.text("pc-f1", 144, 3088, "✓  Up to 10 agents", TEXT_STYLES.item, {
    deps: cardDependencies,
  });
  scene.text("pc-f2", 144, 3116, "✓  Community support", TEXT_STYLES.item, {
    deps: cardDependencies,
  });
  scene.text("pc-f3", 144, 3144, "✓  7-day trace history", TEXT_STYLES.item, {
    deps: cardDependencies,
  });
  scene.rect("pc-btn", 144, 3176, 274, 44, {
    r: 8,
    fill: COLORS.ink,
    deps: cardDependencies,
  });
  scene.text("pc-btn-t", 144, 3187, "Start free", TEXT_STYLES.btn, {
    w: 274,
    align: "center",
    deps: ["r:pc-btn"],
  });
  scene.duplicate(
    "plans",
    [
      "pc",
      "pc-name",
      "pc-price",
      "pc-per",
      "pc-desc",
      "pc-rule",
      "pc-f1",
      "pc-f2",
      "pc-f3",
      "pc-btn",
      "pc-btn-t",
    ],
    planCopies
  );
}
