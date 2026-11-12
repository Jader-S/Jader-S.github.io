import {
  COLORS,
  TEXT_STYLES,
  FRAME_LEFT,
  FRAME_RIGHT,
  EDGE_START,
  EDGE_END,
} from "../theme.js";

/**
 * 创建顶部导航，所有元素在构建结束前一起标记为吸顶层。
 * @param {import("../scene-builder.js").SceneBuilder} scene 当前页面构建器。
 * @returns {void}
 */
export function createNavigation(scene) {
  // 导航保留24像素上沿与64像素高度，施工时由独立吸顶坐标系渲染。
  const firstElement = scene.elements.length;
  scene.path(
    "rule-top",
    [
      { x: EDGE_START, y: 24 },
      { x: EDGE_END, y: 24 },
    ],
    { add: false }
  );
  scene.frame("nav", 24, 88, true);
  scene.logo("mark", FRAME_LEFT + 24, 45, 22);
  scene.text("brand", FRAME_LEFT + 52, 44, "Swarm", TEXT_STYLES.brand);
  scene.text("nav0", 540, 46, "Product", TEXT_STYLES.nav);
  scene.duplicate(
    "nav",
    ["nav0"],
    [
      { dx: 96, dy: 0, edits: ["Agents"] },
      { dx: 192, dy: 0, edits: ["Docs"] },
      { dx: 288, dy: 0, edits: ["Pricing"] },
    ]
  );
  scene.vertical("nav-div", FRAME_RIGHT - 176, 24, 88);
  scene.rect("nav-btn", FRAME_RIGHT - 156, 36, 136, 40, {
    r: 8,
    fill: COLORS.ink,
  });
  scene.text("nav-btn-t", FRAME_RIGHT - 156, 46, "Get access", TEXT_STYLES.btn, {
    w: 136,
    align: "center",
    deps: ["r:nav-btn"],
  });
  scene.elements.slice(firstElement).forEach((element) => {
    element.sticky = true;
  });
}
