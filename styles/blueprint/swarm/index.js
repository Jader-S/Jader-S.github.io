// 公开入口只导出组件与场景描述工具；样式由宿主显式引入styles/index.css。
export { SwarmExperience } from "./SwarmExperience.jsx";
export { SceneBuilder } from "./scene/scene-builder.js";
export { createScene } from "./scene/create-scene.js";
export { ElementKind, TaskType } from "./scene/types.js";
export {
  COLORS,
  TEXT_STYLES,
  PAGE_WIDTH,
  sansStyle,
  monoStyle,
} from "./scene/theme.js";
export {
  ActionType,
  DialogKind,
  InteractionStyle,
  PlanName,
  PAGE_INTERACTIONS,
} from "./interactions/actions.js";
