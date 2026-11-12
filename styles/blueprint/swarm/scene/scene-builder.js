import {
  COLORS,
  FRAME_LEFT,
  FRAME_RIGHT,
  EDGE_START,
  EDGE_END,
  LOGO_PATHS,
} from "./theme.js";
import { ElementKind, TaskType } from "./types.js";

/**
 * 将可编辑的页面元素转换为场景与施工任务，维护复制和文字替换的依赖关系。
 * @author 程序员阿鑫
 */
export class SceneBuilder {
  /** 初始化独立的页面元素、任务和重复组容器。 */
  constructor() {
    // 每次创建页面都使用全新对象，回放不会污染之前的元素状态。
    this.elements = [];
    this.tasks = [];
    this.groups = [];
    this.byId = new Map();
  }

  /**
   * 注册一个元素，并建立按稳定标识查询的索引。
   * @param {object} element 包含kind和id的完整元素状态。
   * @returns {object} 注册后的元素。
   */
  addElement(element) {
    // 创建阶段就检查重复标识，避免任务悄悄绘制到另一个区块。
    if (this.byId.has(element.id)) throw new Error(`场景元素标识重复：${element.id}`);
    this.elements.push(element);
    this.byId.set(element.id, element);
    return element;
  }

  /**
   * 注册一项施工任务，依赖标识直接交给引擎调度。
   * @param {string} id 稳定任务标识。
   * @param {number} y 设计画布中的任务纵坐标。
   * @param {object} spec 任务类型及目标元素描述。
   * @param {string[]} deps 必须先完成的任务，默认没有前置依赖。
   * @returns {string} 当前任务标识，可供后续元素直接引用。
   */
  task(id, y, spec, deps = []) {
    // 保留声明顺序，距离与滚动优先级相同时仍有稳定的施工顺序。
    this.tasks.push({ id, y, spec, deps });
    return id;
  }

  /**
   * 添加路径及对应的描线任务，用于分隔线、连接线和品牌图标。
   * @param {string} id 路径标识。
   * @param {{x:number,y:number}[]} points 按描绘顺序排列的锚点。
   * @param {object} options 颜色、线宽、填充、SVG原始路径及依赖。
   * @returns {string} 路径施工任务标识。
   */
  path(id, points, options = {}) {
    // SVG轮廓和锚点分别服务最终渲染与逐点施工，二者保持同一设计坐标。
    this.addElement({
      kind: ElementKind.PATH,
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      pts: points,
      closed: Boolean(options.closed),
      stroke: options.stroke ?? COLORS.line,
      sw: options.sw ?? 1,
      fill: options.fill,
      d: options.d,
      tf: options.tf,
      add: options.add ?? true,
      placed: 0,
      shut: false,
      edit: false,
      owner: null,
      fillOn: false,
    });
    return this.task(
      `p:${id}`,
      Math.min(...points.map((point) => point.y)),
      { type: TaskType.PATH, el: id },
      options.deps
    );
  }

  /**
   * 添加矩形，施工时先拉出灰色几何，再应用圆角、颜色与边框。
   * @param {string} id 矩形标识。
   * @param {number} x 设计横坐标。
   * @param {number} y 设计纵坐标。
   * @param {number} width 设计宽度。
   * @param {number} height 设计高度。
   * @param {object} options 圆角r、填充fill、边框stroke与依赖deps。
   * @returns {string} 矩形施工任务标识。
   */
  rect(id, x, y, width, height, options = {}) {
    // draw只记录正在拖出的临时尺寸，最终w/h始终保持设计数据。
    this.addElement({
      kind: ElementKind.RECTANGLE,
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      x,
      y,
      w: width,
      h: height,
      r: options.r ?? 0,
      fill: options.fill ?? COLORS.card,
      stroke: options.stroke,
      draw: null,
      styled: false,
    });
    return this.task(`r:${id}`, y, { type: TaskType.RECTANGLE, el: id }, options.deps);
  }

  /**
   * 添加文字，文本与布局数据始终保存在源码中，动画仅更新shown字段。
   * @param {string} id 文字标识。
   * @param {number} x 设计横坐标。
   * @param {number} y 设计纵坐标。
   * @param {string} content 最终完整文案。
   * @param {object} style 来自主题文件的文字样式。
   * @param {object} options 宽度、对齐、吸附参考线、字体放大或动态文案函数。
   * @returns {string} 文字施工任务标识。
   */
  text(id, x, y, content, style, options = {}) {
    // 参考线和动态文案只写入任务协议，构建器不控制动画时间。
    this.addElement({
      kind: ElementKind.TEXT,
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      x,
      y,
      w: options.w,
      align: options.align ?? "left",
      text: style.upper ? content.toUpperCase() : content,
      shown: "",
      st: style,
      size: style.size,
      editing: false,
      selAll: false,
      dyn: options.dyn,
    });
    return this.task(
      `t:${id}`,
      y,
      { type: TaskType.TEXT, el: id, snap: options.snap, grow: options.grow },
      options.deps
    );
  }

  /**
   * 添加从标尺拖出的参考线。
   * @param {string} id 参考线标识。
   * @param {"x"|"y"} axis 参考线约束的坐标轴。
   * @param {number} position 最终参考线坐标。
   * @param {number} taskY 对应的滚动触发纵坐标。
   * @returns {string} 参考线施工任务标识。
   */
  guide(id, axis, position, taskY) {
    // cur保存拖动中的位置，pos保存编辑时可直接修改的最终吸附位置。
    this.addElement({
      kind: ElementKind.GUIDE,
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      axis,
      pos: position,
      cur: position,
      op: 1,
      flash: 0,
      dragging: false,
    });
    return this.task(`g:${id}`, taskY, { type: TaskType.GUIDE, el: id });
  }

  /**
   * 复制一组文字和矩形；先复制外观，再逐项替换不同文案。
   * @param {string} id 重复组标识。
   * @param {string[]} elementIds 原始组元素标识，顺序决定edits中文案对应关系。
   * @param {{dx:number,dy:number,edits:string[]}[]} copies 副本偏移和新文案。
   * @returns {void}
   */
  duplicate(id, elementIds, copies) {
    // 副本依赖原组所有施工任务，保持原站先做一个、再拖动复制的观感。
    const group = { id, ids: elementIds, copies: [] };
    const sourceTasks = this.tasks
      .filter((task) => "el" in task.spec && elementIds.includes(task.spec.el))
      .map((task) => task.id);
    const copyTasks = [];
    copies.forEach((copy, copyIndex) => {
      const ids = [];
      let textIndex = 0;
      for (const sourceId of elementIds) {
        const source = this.byId.get(sourceId);
        const copyId = `${sourceId}~${copyIndex + 1}`;
        ids.push(copyId);
        if (source.kind === ElementKind.TEXT) {
          const replacement = copy.edits[textIndex++];
          const text = source.st.upper ? replacement?.toUpperCase() : replacement;
          this.addElement({
            ...source,
            id: copyId,
            x: source.x + copy.dx,
            y: source.y + copy.dy,
            text: text ?? source.text,
          });
        } else if (source.kind === ElementKind.RECTANGLE) {
          this.addElement({
            ...source,
            id: copyId,
            x: source.x + copy.dx,
            y: source.y + copy.dy,
          });
        }
      }
      group.copies.push({ dx: copy.dx, dy: copy.dy, ids });
      const top = Math.min(...ids.map((elementId) => this.byId.get(elementId).y));
      copyTasks.push(
        this.task(
          `d:${id}:${copyIndex}`,
          top,
          { type: TaskType.DUPLICATE, group: id, k: copyIndex },
          sourceTasks
        )
      );
    });
    // 所有复制结束后才替换副本文案，避免后续副本复制到已替换的内容。
    group.copies.forEach((copy) =>
      copy.ids.forEach((elementId, index) => {
        const element = this.byId.get(elementId);
        const source = this.byId.get(elementIds[index]);
        if (element.kind === ElementKind.TEXT && element.text !== source.text) {
          this.task(
            `e:${elementId}`,
            element.y,
            { type: TaskType.EDIT_TEXT, el: elementId },
            copyTasks
          );
        }
      })
    );
    this.groups.push(group);
  }

  /**
   * 添加区块下边界和左右边界，横线延伸至画布之外。
   * @param {string} id 区块标识。
   * @param {number} top 区块顶边。
   * @param {number} bottom 区块底边。
   * @param {boolean} reverse 是否反向描绘横线。
   * @returns {void}
   */
  frame(id, top, bottom, reverse = false) {
    // 交替改变描线方向，保留不同光标从两侧进入页面的施工节奏。
    const [start, end] = reverse ? [EDGE_END, EDGE_START] : [EDGE_START, EDGE_END];
    this.path(`rule-${id}`, [
      { x: start, y: bottom },
      { x: end, y: bottom },
    ]);
    this.path(`left-${id}`, [
      { x: FRAME_LEFT, y: top },
      { x: FRAME_LEFT, y: bottom },
    ]);
    this.path(`right-${id}`, [
      { x: FRAME_RIGHT, y: bottom },
      { x: FRAME_RIGHT, y: top },
    ]);
  }

  /**
   * 添加竖向分隔线。
   * @param {string} id 路径标识。
   * @param {number} x 横坐标。
   * @param {number} top 起点纵坐标。
   * @param {number} bottom 终点纵坐标。
   * @param {string[]} deps 前置施工任务。
   * @returns {string} 竖线施工任务标识。
   */
  vertical(id, x, top, bottom, deps = []) {
    // 统一通过path注册，线条共享相同的施工与渲染协议。
    return this.path(
      id,
      [
        { x, y: top },
        { x, y: bottom },
      ],
      { deps }
    );
  }

  /**
   * 添加横向分隔线，默认贯穿整个页面。
   * @param {string} id 路径标识。
   * @param {number} y 纵坐标。
   * @param {number} left 起点横坐标。
   * @param {number} right 终点横坐标。
   * @param {string[]} deps 前置施工任务。
   * @returns {string} 横线施工任务标识。
   */
  horizontal(id, y, left = EDGE_START, right = EDGE_END, deps = []) {
    // 页面网格与有限长度分隔线均可复用该方法。
    return this.path(
      id,
      [
        { x: left, y },
        { x: right, y },
      ],
      { deps }
    );
  }

  /**
   * 以指定高度添加完整Swarm矢量标志和施工锚点。
   * @param {string} id 标志元素标识前缀。
   * @param {number} x 左上角横坐标。
   * @param {number} y 左上角纵坐标。
   * @param {number} height 标志的最终高度。
   * @returns {void}
   */
  logo(id, x, y, height) {
    // 原始标志坐标高度为140，路径和施工锚点使用同一缩放比例。
    const transform = { x, y, s: height / 140 };
    LOGO_PATHS.forEach((path, index) => {
      this.path(
        `${id}${index}`,
        path.anchors.map(([anchorX, anchorY]) => ({
          x: x + anchorX * transform.s,
          y: y + anchorY * transform.s,
        })),
        {
          closed: true,
          stroke: COLORS.ink,
          fill: COLORS.ink,
          add: false,
          d: path.d,
          tf: transform,
        }
      );
    });
  }
}
