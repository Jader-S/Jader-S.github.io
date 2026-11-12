import {
  COLORS,
  TEXT_STYLES,
  CONTENT_LEFT,
  FRAME_LEFT,
  sansStyle,
  monoStyle,
} from "../theme.js";

/**
 * 创建页面底部行动区与实际施工人数说明。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @param {() => number} getWorkerCount 引擎返回的累计参与施工光标数量。
 * @returns {void}
 */
export function createClosing(scene, getWorkerCount) {
  // 人数文案只在施工时取值，避免在场景创建时提前固定为初始人数。
  scene.frame("cta", 3280, 3690);
  scene.vertical("cta-div", 800, 3280, 3690);
  scene.guide("g-cta", "x", CONTENT_LEFT, 3300);
  scene.guide("g-cta-r", "x", 840, 3300);
  scene.text(
    "x-title",
    CONTENT_LEFT,
    3352,
    "Let the swarm\nbuild it.",
    TEXT_STYLES.h1,
    { w: 560, snap: "g-cta", grow: true }
  );
  scene.text(
    "x-lead",
    CONTENT_LEFT,
    3506,
    "Start with ten agents for free. Scale to ten thousand when you’re ready.",
    TEXT_STYLES.lead,
    { w: 460, snap: "g-cta" }
  );
  scene.rect("x-btn", CONTENT_LEFT, 3596, 184, 48, { r: 8, fill: COLORS.ink });
  scene.text("x-btn-t", CONTENT_LEFT, 3609, "Start building", TEXT_STYLES.btn, {
    w: 184,
    align: "center",
    deps: ["r:x-btn"],
  });
  scene.text("x-count", 840, 3352, "", monoStyle(13, COLORS.accent, 500), {
    w: 320,
    snap: "g-cta-r",
    dyn: () => `This page was built by ${getWorkerCount()} agents while you scrolled.`,
  });
  scene.text(
    "x-note",
    840,
    3414,
    "Every line, guide and word above was placed by a cursor working alongside the others.",
    TEXT_STYLES.body,
    { w: 320, snap: "g-cta-r" }
  );
}

/**
 * 创建页脚品牌与三列导航说明。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createFooter(scene) {
  // 右侧两列通过复制首列生成，与原站的复制、选中文案和重新输入动作对应。
  scene.frame("footer", 3690, 3970, true);
  scene.guide("g-foot", "x", 560, 3700);
  scene.logo("fmark", CONTENT_LEFT, 3735, 22);
  scene.text("f-brand", FRAME_LEFT + 62, 3734, "Swarm", TEXT_STYLES.brand);
  scene.text(
    "f-copy",
    CONTENT_LEFT,
    3916,
    "© 2026 Swarm Labs, Inc.",
    TEXT_STYLES.small
  );
  scene.text("fc-h", 560, 3738, "Product", sansStyle(14.5, 600, 1.4, COLORS.ink), {
    snap: "g-foot",
  });
  scene.text("fc-1", 560, 3772, "Agents", TEXT_STYLES.item, { snap: "g-foot" });
  scene.text("fc-2", 560, 3802, "Routing", TEXT_STYLES.item);
  scene.text("fc-3", 560, 3832, "Pricing", TEXT_STYLES.item);
  scene.duplicate(
    "fcols",
    ["fc-h", "fc-1", "fc-2", "fc-3"],
    [
      { dx: 200, dy: 0, edits: ["Company", "About", "Careers", "Blog"] },
      {
        dx: 400,
        dy: 0,
        edits: ["Developers", "Docs", "API reference", "Status"],
      },
    ]
  );
}
