/** 光标工人数量与显示身份，集中配置便于调整施工密度。 */
export const WORKER_LIMITS = Object.freeze({
  INITIAL: 10,
  BASE: 5,
  FOLLOW: 16,
  MAXIMUM: 20,
});
export const CURSOR_NAMES = [
  "Ada",
  "Linus",
  "Grace",
  "Alan",
  "Margaret",
  "Ken",
  "Barbara",
  "Dennis",
  "Radia",
  "Guido",
  "Frances",
  "Bjarne",
  "Hedy",
  "Tim",
  "Katherine",
  "Edsger",
  "Joan",
  "Donald",
  "Sophie",
  "Niklaus",
  "Anita",
  "Brian",
  "Mary",
  "Rob",
  "Ida",
  "Yukihiro",
  "Shafi",
  "Leslie",
  "Jean",
  "Vint",
  "Lynn",
  "Bram",
];
export const CURSOR_COLORS = [
  "#F24E1E",
  "#A259FF",
  "#1ABCFE",
  "#0ACF83",
  "#FF7262",
  "#FFC700",
  "#9747FF",
  "#E8467C",
  "#14AE5C",
  "#0D99FF",
  "#FF8A00",
  "#00B5CE",
];

/** 施工任务状态，供依赖调度与参考线收尾统一判断。 */
export const TaskState = Object.freeze({
  WAITING: "wait",
  ACTIVE: "active",
  DONE: "done",
});

/** 设计工具光标，名称与渲染组件共享，避免散落的字符串状态。 */
export const CursorShape = Object.freeze({
  ARROW: "arrow",
  DUPLICATE: "dup",
  PEN: "pen",
  PEN_ADD: "pen-add",
  PEN_CLOSE: "pen-close",
  CROSS: "cross",
  TEXT: "ibeam",
  RESIZE_X: "ew",
  RESIZE_Y: "ns",
});
