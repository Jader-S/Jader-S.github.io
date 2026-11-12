import React from "react";
import { RULER_SIZE } from "../scene/theme.js";
import { ElementKind } from "../scene/types.js";

const SELECTION_COLOR = "#0D99FF";
const GUIDE_COLOR = "#F24822";

/**
 * 绘制施工光标产生的锚点、参考线、选框、尺寸标签与间距测量。
 * @param {{engine:object}} props 共享动画引擎；仅读取场景与光标当前状态。
 * @returns {React.ReactElement} 位于内容上方且不拦截指针的施工图层。
 */
export function ConstructionOverlay({ engine }) {
  const { s: scale, left: offsetX, vw: viewportWidth, scrollY } = engine.vp;
  const canvasHeight = engine.height * scale;
  const shapes = [];
  const labels = [];
  let nextKey = 0;

  /**
   * 将设计坐标横向投影为居中画布内的屏幕坐标。
   * @param {number} value 设计坐标的横向位置。
   * @returns {number} 实际画布内的横向像素位置。
   */
  function projectX(value) {
    // 画布横向偏移不随滚动改变。
    return offsetX + value * scale;
  }

  /**
   * 将设计坐标纵向投影为文档坐标，滚动交给浏览器完成。
   * @param {number} value 设计坐标的纵向位置。
   * @returns {number} 文档内的纵向像素位置。
   */
  function projectY(value) {
    // 图层跟随整个页面，因此这里不能重复扣除scrollY。
    return value * scale;
  }

  // 场景参考线保持原站贯穿画布的长度，并在吸附时短暂加粗发亮。
  for (const element of engine.list) {
    if (element.kind === ElementKind.GUIDE && element.vis && element.op > 0) {
      const glow =
        element.flash > 0
          ? `drop-shadow(0 0 ${2 + element.flash * 3}px ${GUIDE_COLOR})`
          : undefined;
      const lineStyle = {
        stroke: GUIDE_COLOR,
        strokeWidth: 1 + element.flash,
        opacity: element.op,
        style: { filter: glow },
      };
      shapes.push(
        element.axis === "x" ? (
          <line
            key={nextKey++}
            x1={projectX(element.cur)}
            x2={projectX(element.cur)}
            y1={0}
            y2={canvasHeight}
            {...lineStyle}
          />
        ) : (
          <line
            key={nextKey++}
            x1={0}
            x2={viewportWidth}
            y1={projectY(element.cur)}
            y2={projectY(element.cur)}
            {...lineStyle}
          />
        )
      );
    }

    // 路径处于编辑状态时，将已落下锚点与负责描绘的光标连接。
    if (element.kind === ElementKind.PATH && element.edit) {
      const stickyOffset = element.sticky ? engine.stick : 0;
      const placedPoints = element.pts.slice(0, element.placed).map((point) => ({
        x: projectX(point.x),
        y: projectY(point.y + stickyOffset),
      }));
      const owner =
        element.owner != null
          ? engine.cursors.find((cursor) => cursor.id === element.owner)
          : null;
      const drawingPoints = owner
        ? [
            ...placedPoints,
            { x: projectX(owner.x), y: projectY(owner.y + stickyOffset) },
          ]
        : placedPoints;
      const closePath =
        element.shut && placedPoints.length
          ? ` ${placedPoints[0].x},${placedPoints[0].y}`
          : "";
      shapes.push(
        <polyline
          key={nextKey++}
          points={
            drawingPoints.map((point) => `${point.x},${point.y}`).join(" ") + closePath
          }
          fill="none"
          stroke={SELECTION_COLOR}
          strokeWidth={1.5}
        />
      );
      for (const point of placedPoints) {
        shapes.push(
          <circle
            key={nextKey++}
            cx={point.x}
            cy={point.y}
            r={3.6}
            fill="#fff"
            stroke={SELECTION_COLOR}
            strokeWidth={1.5}
          />
        );
      }
    }
  }

  // 每个工人可提交自己的选框或测距描述，展示层不干预施工任务。
  const rulerProgress = engine.rulers.t;
  for (const cursor of engine.cursors) {
    if (!cursor.ov) continue;
    const stickyOffset = cursor.sticky ? engine.stick : 0;

    /**
     * 投影当前光标所属元素的纵坐标，补偿吸顶导航的位移。
     * @param {number} value 元素在设计坐标中的纵向位置。
     * @returns {number} 包含吸顶偏移的实际纵向像素位置。
     */
    function cursorY(value) {
      // 吸顶任务仍使用设计坐标，展示时才加入导航偏移。
      return (value + stickyOffset) * scale;
    }

    for (const overlay of cursor.ov()) {
      if (overlay.t === "box") {
        const left = projectX(overlay.b.x);
        const top = cursorY(overlay.b.y);
        const width = overlay.b.w * scale;
        const height = overlay.b.h * scale;
        const color = overlay.color === "red" ? GUIDE_COLOR : SELECTION_COLOR;
        shapes.push(
          <rect
            key={nextKey++}
            x={left}
            y={top}
            width={width}
            height={height}
            fill="none"
            stroke={color}
            strokeWidth={1}
          />
        );

        // 文字编辑中的下划线与选框分开计算，保留字形基线位置。
        if (overlay.underline && overlay.underline.w > 0) {
          const underline = overlay.underline;
          shapes.push(
            <line
              key={nextKey++}
              x1={projectX(underline.x)}
              x2={projectX(underline.x + underline.w)}
              y1={cursorY(underline.y)}
              y2={cursorY(underline.y)}
              stroke={SELECTION_COLOR}
              strokeWidth={1.5}
            />
          );
        }
        if (overlay.rulerLines && rulerProgress > 0.05) {
          shapes.push(
            <g
              key={nextKey++}
              stroke={SELECTION_COLOR}
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={rulerProgress}
            >
              <line
                x1={RULER_SIZE}
                x2={left}
                y1={top + height / 2}
                y2={top + height / 2}
              />
              <line
                x1={left + width / 2}
                x2={left + width / 2}
                y1={scrollY + RULER_SIZE}
                y2={top}
              />
            </g>
          );
        }
        if (overlay.handles) {
          for (const [handleX, handleY] of [
            [left, top],
            [left + width, top],
            [left, top + height],
            [left + width, top + height],
          ]) {
            shapes.push(
              <rect
                key={nextKey++}
                x={handleX - 3.5}
                y={handleY - 3.5}
                width={7}
                height={7}
                fill="#fff"
                stroke={SELECTION_COLOR}
                strokeWidth={1}
              />
            );
          }
        }
        if (overlay.badge && width > 0) {
          labels.push(
            <div
              key={nextKey++}
              className="badge"
              style={{
                left: left + width / 2,
                top: top + height + 8,
                background: color,
              }}
            >
              {overlay.badge}
            </div>
          );
        }
      } else {
        // 水平和垂直测距标签采用各自的偏移，防止与测距线重叠。
        const start = { x: projectX(overlay.a.x), y: cursorY(overlay.a.y) };
        const end = { x: projectX(overlay.b.x), y: cursorY(overlay.b.y) };
        const horizontal = start.y === end.y;
        shapes.push(
          <line
            key={nextKey++}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={GUIDE_COLOR}
            strokeWidth={1}
          />
        );
        labels.push(
          <div
            key={nextKey++}
            className="badge"
            style={{
              left: horizontal ? (start.x + end.x) / 2 : start.x + 18,
              top: horizontal ? start.y + 8 : (start.y + end.y) / 2 - 9,
              background: GUIDE_COLOR,
            }}
          >
            {overlay.label}
          </div>
        );
      }
    }
  }

  return (
    <div className="overlay" style={{ height: canvasHeight }} aria-hidden="true">
      <svg width={viewportWidth} height={canvasHeight}>
        {shapes}
      </svg>
      {labels}
    </div>
  );
}
