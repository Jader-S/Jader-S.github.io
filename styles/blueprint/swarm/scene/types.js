/** 场景中可编辑元素的类型，渲染器与动画调度器共享同一协议。 */
export const ElementKind = Object.freeze({
  PATH: "path",
  RECTANGLE: "rect",
  TEXT: "text",
  GUIDE: "guide",
});

/** 施工任务类型，重复组先复制再替换文案，保持参考站的施工顺序。 */
export const TaskType = Object.freeze({
  PATH: "path",
  RECTANGLE: "rect",
  TEXT: "text",
  GUIDE: "guide",
  DUPLICATE: "dup",
  EDIT_TEXT: "edit",
});

/**
 * @typedef {object} SceneElement
 * @property {string} id 稳定元素标识，施工任务通过该标识定位元素。
 * @property {string} kind ElementKind中的元素类型。
 * @property {number} v 渲染版本；动画改动元素后递增，用于React局部刷新。
 * @property {boolean} vis 当前是否已经出现在施工画布上。
 * @property {number} dx 施工拖动相对于设计坐标的横向偏移。
 * @property {number} dy 施工拖动相对于设计坐标的纵向偏移。
 * @property {object} [st] 文字样式，保存字号、行高、字重与颜色。
 * @property {number} [w] 元素设计宽度，未设置时按文字内容测量。
 * @property {number} [h] 元素设计高度。
 * @property {boolean} [sticky] 是否属于吸顶导航层。
 */

/**
 * @typedef {object} SceneTask
 * @property {string} id 任务标识。
 * @property {number} y 任务在设计画布中的纵坐标，决定滚动调度优先级。
 * @property {object} spec 任务目标，包括type/el或group/k。
 * @property {string[]} deps 必须先完成的任务标识列表。
 */
