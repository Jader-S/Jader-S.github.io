import { ElementKind } from "../scene/types.js";
import { lineHeight, measureText } from "../scene/text-metrics.js";
import { CursorShape, TaskState } from "./config.js";
import { markChanged, randomBetween } from "./motion.js";

const EDGE_MIN = -10000;
const EDGE_MAX = 10000;

/**
 * 将场景对象的创建、复制和编辑拆成可逐帧执行的设计工具动作。
 * 位置换算、时钟、移动、输入与对象索引由SwarmEngine提供。
 * @author 程序员阿鑫
 */
export class DrawingEngine {
  /**
   * 将无限延伸的横线锚点投影到当前视口边缘。
   * @param {{x:number,y:number}} point 场景路径锚点。
   * @returns {{x:number,y:number}|Function} 普通锚点或随视口变化的锚点函数。
   */
  anchor(point) {
    // 页面横线使用极值坐标定义，工人只需要走到当前屏幕可见边缘。
    if (point.x <= EDGE_MIN)
      return () => ({ x: this.fromViewport(6, 0).x, y: point.y });
    if (point.x >= EDGE_MAX)
      return () => ({ x: this.fromViewport(this.vp.vw - 6, 0).x, y: point.y });
    return point;
  }

  /**
   * 使用钢笔工具逐个放置路径锚点，结束后关闭编辑控制点。
   * @param {object} cursor 当前工人。
   * @param {object} element 路径对象。
   * @yields {undefined} 按锚点逐帧绘制。
   */
  *drawPath(cursor, element) {
    // 品牌标志使用完整SVG轮廓；其他路径由直线锚点逐步构建。
    if (element.d) {
      yield* this.drawLogo(cursor, element);
      return;
    }
    cursor.shape = element.add ? CursorShape.PEN_ADD : CursorShape.PEN;
    yield* this.moveTo(cursor, this.anchor(element.pts[0]));
    yield* this.click(cursor);
    element.vis = true;
    element.edit = true;
    element.placed = 1;
    element.owner = cursor.id;
    markChanged(element);
    cursor.shape = CursorShape.PEN;
    for (let index = 1; index < element.pts.length; index++) {
      yield* this.moveTo(cursor, this.anchor(element.pts[index]), {
        bend: randomBetween(-0.03, 0.03),
      });
      yield* this.click(cursor);
      element.placed = index + 1;
      markChanged(element);
      yield* this.wait(randomBetween(0.04, 0.12));
    }
    if (element.closed) {
      cursor.shape = CursorShape.PEN_CLOSE;
      yield* this.moveTo(cursor, element.pts[0], {
        bend: randomBetween(-0.03, 0.03),
      });
      yield* this.click(cursor);
      element.shut = true;
      markChanged(element);
    }
    // 工人移开后再隐藏编辑框，形成真实设计工具的收尾节奏。
    element.owner = null;
    markChanged(element);
    cursor.shape = CursorShape.PEN;
    yield* this.moveTo(
      cursor,
      {
        x: cursor.x + randomBetween(14, 30),
        y: cursor.y + randomBetween(10, 24),
      },
      { speed: 1.4 }
    );
    yield* this.wait(0.3);
    element.edit = false;
    if (element.fill) element.fillOn = true;
    markChanged(element);
  }

  /**
   * 沿品牌标志的轮廓锚点巡行，完成描边后填充。
   * @param {object} cursor 当前工人。
   * @param {object} element 带原始SVG路径的对象。
   * @yields {undefined} 逐步绘制标志。
   */
  *drawLogo(cursor, element) {
    // placed用于驱动SVG的strokeDashoffset，不替换原始曲线形状。
    cursor.shape = CursorShape.PEN;
    yield* this.moveTo(cursor, this.anchor(element.pts[0]));
    element.vis = true;
    element.placed = 1;
    markChanged(element);
    for (let index = 1; index <= element.pts.length; index++) {
      yield* this.moveTo(cursor, element.pts[index % element.pts.length], {
        speed: 1.6,
      });
      element.placed = index + 1;
      markChanged(element);
    }
    element.shut = true;
    element.fillOn = true;
    markChanged(element);
    yield* this.moveTo(
      cursor,
      {
        x: cursor.x + randomBetween(14, 30),
        y: cursor.y + randomBetween(10, 24),
      },
      { speed: 1.4 }
    );
  }

  /**
   * 从矩形左上角拖出尺寸，再应用填充、圆角和边框。
   * @param {object} cursor 当前工人。
   * @param {object} element 矩形对象。
   * @yields {undefined} 逐帧调整矩形尺寸。
   */
  *drawRect(cursor, element) {
    // 拖拽中的灰色矩形与最终样式分别呈现，模拟创建后设置属性。
    cursor.shape = CursorShape.CROSS;
    yield* this.moveTo(cursor, { x: element.x, y: element.y });
    cursor.press = 1;
    element.vis = true;
    element.draw = { w: 0, h: 0 };
    markChanged(element);
    cursor.ov = () => [this.selection(element)];
    yield* this.moveTo(
      cursor,
      { x: element.x + element.w, y: element.y + element.h },
      {
        speed: 0.75,
        drag: true,
        bend: 0,
        onStep: () => {
          // 光标拖到哪里，矩形的当前右下角就更新到哪里。
          element.draw = {
            w: Math.max(0, cursor.x - element.x),
            h: Math.max(0, cursor.y - element.y),
          };
          markChanged(element);
        },
      }
    );
    element.draw = null;
    markChanged(element);
    cursor.shape = CursorShape.ARROW;
    yield* this.wait(randomBetween(0.18, 0.3));
    element.styled = true;
    markChanged(element);
    yield* this.wait(0.35);
    cursor.ov = null;
  }

  /**
   * 创建文字框、逐字输入，并可调整字号或吸附到辅助线。
   * @param {object} cursor 当前工人。
   * @param {object} element 文字对象。
   * @param {object|null} guide 对齐辅助线。
   * @param {boolean} grow 是否从小字号逐步调整至目标字号。
   * @yields {undefined} 逐步创建和排版文字。
   */
  *drawText(cursor, element, guide, grow) {
    // 动态文案在真正施工时计算，以显示已参与工作的工人数。
    if (element.dyn) element.text = element.dyn();
    if (guide) {
      if (guide.axis === "x") {
        element.dx = randomBetween(28, 64);
        element.dy = randomBetween(-8, 8);
      } else {
        element.dx = randomBetween(-8, 8);
        element.dy = randomBetween(18, 34) * (Math.random() < 0.5 ? -1 : 1);
      }
    }
    if (grow) element.size = 18;
    const startX = element.x + element.dx;
    const startY = element.y + element.dy;
    cursor.shape = CursorShape.CROSS;
    yield* this.moveTo(cursor, { x: startX, y: startY });
    if (element.w == null) {
      yield* this.click(cursor);
      element.vis = true;
      element.editing = true;
      markChanged(element);
    } else {
      // 固定宽度文字先拖出空白文本框，随后才开始输入内容。
      cursor.press = 1;
      const textBox = {
        kind: ElementKind.RECTANGLE,
        id: "",
        v: 0,
        vis: true,
        dx: 0,
        dy: 0,
        x: startX,
        y: startY,
        w: 0,
        h: 0,
        r: 0,
        fill: "",
        draw: null,
        styled: true,
      };
      const rowHeight = lineHeight(element.st, element.size);
      cursor.ov = () => [this.selection(textBox)];
      yield* this.moveTo(
        cursor,
        { x: startX + element.w, y: startY + rowHeight },
        {
          speed: 0.9,
          drag: true,
          bend: 0,
          onStep: () => {
            textBox.w = Math.max(0, cursor.x - startX);
            textBox.h = Math.max(0, cursor.y - startY);
          },
        }
      );
      element.vis = true;
      element.editing = true;
      markChanged(element);
    }
    cursor.shape = CursorShape.TEXT;
    cursor.ov = () => [{ t: "box", b: this.bounds(element) }];
    yield* this.moveTo(
      cursor,
      {
        x: cursor.x + randomBetween(-30, 10),
        y: cursor.y + randomBetween(10, 30),
      },
      { speed: 1.5 }
    );
    yield* this.type(element, element.text);
    yield* this.wait(0.12);
    element.editing = false;
    markChanged(element);
    cursor.shape = CursorShape.ARROW;
    cursor.ov = () => [this.selection(element)];
    if (grow) {
      const sizes = [24, 32, 40, 48, 56, 64, 72].filter(
        (size) => size < element.st.size
      );
      for (const size of [...sizes, element.st.size]) {
        yield* this.wait(0.06);
        element.size = size;
        markChanged(element);
      }
      yield* this.wait(0.15);
    }
    if (guide) {
      // 辅助线可能由另一位工人拖出，文字必须等待它到位再吸附。
      const guideTask = this.byTask.get("g:" + guide.id);
      while (guideTask.state !== TaskState.DONE) yield;
      const bounds = this.bounds(element);
      const grab = {
        x: bounds.x + Math.min(bounds.w * 0.4, 60) + randomBetween(-6, 6),
        y: bounds.y + Math.min(bounds.h * 0.5, 22),
      };
      yield* this.moveTo(cursor, grab);
      cursor.press = 1;
      const aligned = { x: grab.x - element.dx, y: grab.y - element.dy };
      const approach = {
        x:
          aligned.x +
          (guide.axis === "x" ? -randomBetween(2, 5) : randomBetween(-6, 6)),
        y:
          aligned.y +
          (guide.axis === "y" ? -randomBetween(2, 5) : randomBetween(-3, 3)),
      };
      const updateAlignment = () => {
        // 接近参考线时自动吸附，并短暂加亮参考线。
        let offsetX = cursor.x - aligned.x;
        let offsetY = cursor.y - aligned.y;
        if (guide.axis === "x" && Math.abs(offsetX) < 9) {
          if (offsetX !== 0 && element.dx !== 0) guide.flash = 1;
          offsetX = 0;
        }
        if (guide.axis === "y" && Math.abs(offsetY) < 9) {
          if (offsetY !== 0 && element.dy !== 0) guide.flash = 1;
          offsetY = 0;
        }
        element.dx = offsetX;
        element.dy = offsetY;
        markChanged(element);
        markChanged(guide);
      };
      yield* this.moveTo(cursor, approach, {
        speed: 0.6,
        drag: true,
        onStep: updateAlignment,
      });
      yield* this.wait(0.1);
      yield* this.moveTo(cursor, aligned, {
        speed: 2,
        onStep: updateAlignment,
      });
      element.dx = 0;
      element.dy = 0;
      markChanged(element);
      yield* this.wait(0.25);
    } else {
      yield* this.wait(0.2);
    }
    cursor.ov = null;
  }

  /**
   * 从顶部或左侧标尺拖出水平或垂直辅助线。
   * @param {object} cursor 当前工人。
   * @param {object} guide 辅助线对象。
   * @yields {undefined} 完成从标尺到页面位置的拖拽。
   */
  *dragGuide(cursor, guide) {
    // 多位工人可同时申请标尺，finally保证每次申请都有对应释放。
    this.rulers.want++;
    try {
      const jitter = randomBetween(-0.15, 0.15);
      const rulerPoint = () =>
        guide.axis === "x"
          ? this.fromViewport(10, this.vp.vh * (0.45 + jitter))
          : this.fromViewport(
              this.vp.left + (guide.pos > 0 ? 400 : 300) * this.vp.s + jitter * 200,
              10
            );
      cursor.shape = CursorShape.ARROW;
      yield* this.moveTo(cursor, rulerPoint);
      while (this.rulers.t < 0.95) yield;
      yield* this.moveTo(cursor, rulerPoint, { speed: 3 });
      cursor.press = 1;
      cursor.shape = guide.axis === "x" ? CursorShape.RESIZE_X : CursorShape.RESIZE_Y;
      guide.vis = true;
      guide.dragging = true;
      guide.op = 1;
      const updatePosition = () => {
        // 辅助线始终穿过拖拽光标的位置。
        guide.cur = guide.axis === "x" ? cursor.x : cursor.y;
        markChanged(guide);
      };
      updatePosition();
      const destination = () => {
        const start = rulerPoint();
        return guide.axis === "x"
          ? { x: guide.pos, y: start.y + 40 }
          : { x: start.x + 30, y: guide.pos };
      };
      yield* this.moveTo(cursor, destination, {
        speed: 0.55,
        drag: true,
        onStep: updatePosition,
      });
      guide.cur = guide.pos;
      guide.dragging = false;
      markChanged(guide);
      cursor.shape = CursorShape.ARROW;
      yield* this.wait(0.25);
    } finally {
      this.rulers.want--;
    }
  }

  /**
   * 复制整个元素组到目标位置，过程中显示两组选区与间距。
   * @param {object} cursor 当前工人。
   * @param {object} group 源元素组及复制目标配置。
   * @param {number} copyIndex 本次目标副本序号。
   * @yields {undefined} 完成选择、复制与拖拽。
   */
  *duplicate(cursor, group, copyIndex) {
    // 从原组和已经完成的副本中选最近者，减少不必要的长距离拖动。
    const copy = group.copies[copyIndex];
    const candidates = [
      { dx: 0, dy: 0, ids: group.ids },
      ...group.copies.filter(
        (candidate, index) =>
          this.byTask.get(`d:${group.id}:${index}`)?.state === TaskState.DONE
      ),
    ];
    let source = candidates[0];
    for (const candidate of candidates) {
      if (
        Math.hypot(candidate.dx - copy.dx, candidate.dy - copy.dy) <
        Math.hypot(source.dx - copy.dx, source.dy - copy.dy)
      )
        source = candidate;
    }
    const sourceBounds = this.unionBounds(source.ids);
    cursor.shape = CursorShape.ARROW;
    const grab = {
      x: sourceBounds.x + Math.min(sourceBounds.w * 0.45, 70) + randomBetween(-8, 8),
      y: sourceBounds.y + Math.min(sourceBounds.h * 0.45, 30) + randomBetween(-4, 4),
    };
    yield* this.moveTo(cursor, grab);
    yield* this.click(cursor);
    cursor.ov = () => [
      {
        t: "box",
        b: sourceBounds,
        handles: true,
        badge: `${Math.round(sourceBounds.w)} × ${Math.round(sourceBounds.h)}`,
      },
    ];
    yield* this.wait(randomBetween(0.15, 0.3));
    cursor.shape = CursorShape.DUPLICATE;
    yield* this.wait(0.12);
    cursor.press = 1;
    const initialOffsetX = source.dx - copy.dx;
    const initialOffsetY = source.dy - copy.dy;
    copy.ids.forEach((id, index) => {
      const element = this.els.get(id);
      const original = this.els.get(group.ids[index]);
      element.vis = true;
      element.dx = initialOffsetX;
      element.dy = initialOffsetY;
      if (element.kind === ElementKind.TEXT && original.kind === ElementKind.TEXT)
        element.shown = original.text;
      if (element.kind === ElementKind.RECTANGLE) element.styled = true;
      markChanged(element);
    });
    const destination = {
      x: grab.x - initialOffsetX,
      y: grab.y - initialOffsetY,
    };
    cursor.ov = () => {
      // 拖动时红色选框和测距显示新旧两组的空间关系。
      const copyBounds = this.unionBounds(copy.ids);
      const overlays = [
        { t: "box", b: sourceBounds, color: "red" },
        { t: "box", b: copyBounds, color: "red" },
      ];
      const spacing = this.spacing(sourceBounds, copyBounds);
      if (spacing) overlays.push(spacing);
      return overlays;
    };
    yield* this.moveTo(cursor, destination, {
      speed: 0.6,
      drag: true,
      onStep: () => {
        copy.ids.forEach((id) => {
          const element = this.els.get(id);
          element.dx = cursor.x - destination.x;
          element.dy = cursor.y - destination.y;
          markChanged(element);
        });
      },
    });
    yield* this.wait(0.1);
    cursor.shape = CursorShape.ARROW;
    cursor.ov = () => {
      const bounds = this.unionBounds(copy.ids);
      return [
        {
          t: "box",
          b: bounds,
          handles: true,
          badge: `${Math.round(bounds.w)} × ${Math.round(bounds.h)}`,
        },
      ];
    };
    yield* this.wait(0.35);
  }

  /**
   * 计算两个选区之间可显示的水平或垂直间距线。
   * @param {{x:number,y:number,w:number,h:number}} first 第一个选区。
   * @param {{x:number,y:number,w:number,h:number}} second 第二个选区。
   * @returns {object|null} 间距描述；无可见间隔时返回null。
   */
  spacing(first, second) {
    // 有投影重叠才测量间距，避免画出不直观的斜向距离。
    const overlapY =
      Math.min(first.y + first.h, second.y + second.h) - Math.max(first.y, second.y);
    const overlapX =
      Math.min(first.x + first.w, second.x + second.w) - Math.max(first.x, second.x);
    if (overlapY > 0) {
      const y = Math.max(first.y, second.y) + overlapY / 2;
      const [left, right] = first.x < second.x ? [first, second] : [second, first];
      const gap = right.x - (left.x + left.w);
      if (gap > 0)
        return {
          t: "measure",
          a: { x: left.x + left.w, y },
          b: { x: right.x, y },
          label: String(Math.round(gap)),
        };
    } else if (overlapX > 0) {
      const x = Math.max(first.x, second.x) + overlapX / 2;
      const [top, bottom] = first.y < second.y ? [first, second] : [second, first];
      const gap = bottom.y - (top.y + top.h);
      if (gap > 0)
        return {
          t: "measure",
          a: { x, y: top.y + top.h },
          b: { x, y: bottom.y },
          label: String(Math.round(gap)),
        };
    }
    return null;
  }

  /**
   * 双击文字、全选并替换内容，展示复制后独立编辑的过程。
   * @param {object} cursor 当前工人。
   * @param {object} element 待编辑的文字对象。
   * @yields {undefined} 逐步完成选择与替换输入。
   */
  *editText(cursor, element) {
    // 根据第一行实际字宽确定点击位置，避免点在文字框的空白处。
    cursor.shape = CursorShape.ARROW;
    const bounds = this.bounds(element);
    const firstLineWidth =
      measureText(element.shown, element.st, element.size, element.w).lines[0] ??
      bounds.w;
    const firstLineX =
      element.align === "center" && element.w
        ? bounds.x + (element.w - firstLineWidth) / 2
        : bounds.x;
    yield* this.moveTo(cursor, {
      x: firstLineX + Math.min(firstLineWidth * 0.5, 50) + randomBetween(-5, 5),
      y: bounds.y + lineHeight(element.st, element.size) * 0.55,
    });
    yield* this.click(cursor);
    yield* this.wait(0.08);
    yield* this.click(cursor);
    element.editing = true;
    element.selAll = true;
    markChanged(element);
    cursor.shape = CursorShape.TEXT;
    cursor.ov = () => [{ t: "box", b: this.bounds(element) }];
    yield* this.wait(randomBetween(0.2, 0.35));
    yield* this.type(element, element.text, true);
    yield* this.wait(0.12);
    element.editing = false;
    markChanged(element);
    cursor.shape = CursorShape.ARROW;
    cursor.ov = () => [this.selection(element)];
    yield* this.wait(0.3);
  }
}
