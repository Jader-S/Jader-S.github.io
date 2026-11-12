/** 页面交互动作类型，保持场景配置与事件处理使用同一口径。 */
export const ActionType = Object.freeze({
  START: "start",
  SCROLL: "scroll",
  DIALOG: "dialog",
  CUSTOM: "custom",
});

/** 弹窗内容类型，区分配置说明、方案预览与页脚信息。 */
export const DialogKind = Object.freeze({
  QUICK_START: "quick-start",
  DOCS: "docs",
  PLAN: "plan",
  ABOUT: "about",
  CAREERS: "careers",
  BLOG: "blog",
  STATUS: "status",
});

/** 方案类型由点击入口与弹窗共同引用，避免方案名称出现不同口径。 */
export const PlanName = Object.freeze({
  HIVE: "Hive",
  COLONY: "Colony",
  SWARM: "Swarm",
});

/** 点击区域的视觉反馈类型，按钮和文字链接采用不同悬停效果。 */
export const InteractionStyle = Object.freeze({
  LINK: "link",
  BUTTON: "button",
});

/** 点击中心标志即可开始首屏施工，无需先滚动页面。 */
export const START_ACTION = Object.freeze({ type: ActionType.START });

/**
 * 创建已有文字对应的点击区域，副本文字必须等待复制和替换两项动作完成。
 * @param {string} id 文本实体标识。
 * @param {string} label 完整操作名称，供辅助技术和悬停提示使用。
 * @param {object} action 点击后的动作描述。
 * @param {string} [copyTask] 副本对应的复制任务，原始文本不传。
 * @returns {object} 与场景坐标解耦的交互定义。
 */
function textLink(id, label, action, copyTask) {
  // 只绑定稳定实体ID，缩放和位置从当前场景读取，避免维护两套坐标。
  return {
    id,
    elements: [id],
    after: copyTask ? [copyTask, `e:${id}`] : [`t:${id}`],
    label,
    style: InteractionStyle.LINK,
    action,
  };
}

/**
 * 创建矩形与文字组合按钮的点击区域。
 * @param {string} id 背景矩形标识。
 * @param {string} textId 按钮文本标识。
 * @param {string} label 完整操作名称。
 * @param {object} action 点击后的动作描述。
 * @param {string[]} [after] 副本特有的任务依赖，默认等待原按钮绘制和输入完成。
 * @returns {object} 覆盖整个按钮的交互定义。
 */
function button(id, textId, label, action, after = [`r:${id}`, `t:${textId}`]) {
  // 点击范围同时包含底板和文字，整个可见按钮都能响应操作。
  return {
    id,
    elements: [id, textId],
    after,
    label,
    style: InteractionStyle.BUTTON,
    action,
  };
}

/** 页面滚动目标复用已声明的标题实体，不重复保存纵坐标。 */
const destinations = Object.freeze({
  HOME: { type: ActionType.SCROLL },
  PRODUCT: { type: ActionType.SCROLL, target: "f-title" },
  AGENTS: { type: ActionType.SCROLL, target: "p-title" },
  ROUTING: { type: ActionType.SCROLL, target: "fc-title" },
  PRICING: { type: ActionType.SCROLL, target: "$-title" },
});
const quickStart = { type: ActionType.DIALOG, kind: DialogKind.QUICK_START };
const docs = { type: ActionType.DIALOG, kind: DialogKind.DOCS };

/**
 * 页面全部点击入口。新增文案链接时在此注册实体与动作即可，动画本身无需修改。
 * after中的任务必须全部完成，未施工和仍在拖动的副本不进入点击或键盘焦点顺序。
 */
export const PAGE_INTERACTIONS = [
  {
    ...textLink("brand", "Swarm · back to top", destinations.HOME),
    elements: ["brand", "mark0", "mark1", "mark2"],
    after: ["t:brand", "p:mark0", "p:mark1", "p:mark2"],
  },
  textLink("nav0", "Product", destinations.PRODUCT),
  textLink("nav0~1", "Agents", destinations.AGENTS, "d:nav:0"),
  textLink("nav0~2", "Docs", docs, "d:nav:1"),
  textLink("nav0~3", "Pricing", destinations.PRICING, "d:nav:2"),
  button(
    "nav-btn",
    "nav-btn-t",
    "Get access · explore the starter configuration",
    quickStart
  ),
  button("h-btn1", "h-btn1-t", "Start building", quickStart),
  button("h-btn2", "h-btn2-t", "Read the docs", docs),
  textLink("c-link", "Read the configuration spec", {
    ...docs,
    title: "Configuration reference",
  }),
  button("pc-btn", "pc-btn-t", "Start free · preview Hive", {
    type: ActionType.DIALOG,
    kind: DialogKind.PLAN,
    plan: PlanName.HIVE,
  }),
  button(
    "pc-btn~1",
    "pc-btn-t~1",
    "Get Colony · preview plan",
    {
      type: ActionType.DIALOG,
      kind: DialogKind.PLAN,
      plan: PlanName.COLONY,
    },
    ["d:plans:0", "e:pc-name~1", "e:pc-btn-t~1"]
  ),
  button(
    "pc-btn~2",
    "pc-btn-t~2",
    "Contact sales · preview Swarm",
    {
      type: ActionType.DIALOG,
      kind: DialogKind.PLAN,
      plan: PlanName.SWARM,
    },
    ["d:plans:1", "e:pc-name~2", "e:pc-btn-t~2"]
  ),
  button("x-btn", "x-btn-t", "Start building", quickStart),
  {
    ...textLink("f-brand", "Swarm · back to top", destinations.HOME),
    elements: ["f-brand", "fmark0", "fmark1", "fmark2"],
    after: ["t:f-brand", "p:fmark0", "p:fmark1", "p:fmark2"],
  },
  textLink("fc-1", "Agents", destinations.AGENTS),
  textLink("fc-2", "Routing", destinations.ROUTING),
  textLink("fc-3", "Pricing", destinations.PRICING),
  textLink(
    "fc-1~1",
    "About Swarm",
    {
      type: ActionType.DIALOG,
      kind: DialogKind.ABOUT,
    },
    "d:fcols:0"
  ),
  textLink(
    "fc-2~1",
    "Careers",
    {
      type: ActionType.DIALOG,
      kind: DialogKind.CAREERS,
    },
    "d:fcols:0"
  ),
  textLink(
    "fc-3~1",
    "Blog",
    {
      type: ActionType.DIALOG,
      kind: DialogKind.BLOG,
    },
    "d:fcols:0"
  ),
  textLink("fc-1~2", "Docs", docs, "d:fcols:1"),
  textLink(
    "fc-2~2",
    "API reference · example configuration",
    {
      ...docs,
      title: "API reference · local preview",
    },
    "d:fcols:1"
  ),
  textLink(
    "fc-3~2",
    "Status · local preview",
    {
      type: ActionType.DIALOG,
      kind: DialogKind.STATUS,
    },
    "d:fcols:1"
  ),
];
