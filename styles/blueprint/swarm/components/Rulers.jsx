import React from "react";
import { RULER_SIZE } from "../scene/theme.js";
import { ElementKind } from "../scene/types.js";

const GUIDE_COLOR = "#F24822";
const SELECTION_FILL = "rgba(13,153,255,0.22)";

/**
 * 绘制随施工需求滑入滑出的横纵标尺，并标出选区和正在拖动的参考线。
 * @param {{engine:object}} props 提供视口、施工选区与标尺显隐进度的动画引擎。
 * @returns {React.ReactElement|null} 固定在视口左上边缘的标尺。
 */
export function Rulers({ engine }) {
  const progress = engine.rulers.t;
  // 标尺完全收起时移除SVG，避免空闲巡航继续生成不可见刻度。
  if (progress <= 0.001) return null;
  const {
    s: scale,
    left: offsetX,
    vw: viewportWidth,
    vh: viewportHeight,
    scrollY,
  } = engine.vp;
  const majorStep = scale > 0.6 ? 100 : scale > 0.3 ? 200 : 500;
  const horizontalMarks = [];
  const verticalMarks = [];
  const firstHorizontalValue = Math.floor(-offsetX / scale / majorStep) * majorStep;

  // 只生成当前可见范围内的刻度，缩小画布后相应扩大主刻度间隔。
  for (
    let value = firstHorizontalValue;
    offsetX + value * scale < viewportWidth;
    value += majorStep / 2
  ) {
    const position = offsetX + value * scale;
    const major = value % majorStep === 0;
    horizontalMarks.push(
      <line
        key={`tick-${value}`}
        x1={position}
        x2={position}
        y1={major ? 13 : 16}
        y2={RULER_SIZE}
        stroke="#5E5E5E"
      />
    );
    if (major) {
      horizontalMarks.push(
        <text key={`label-${value}`} x={position + 3} y={11} className="rtext">
          {value}
        </text>
      );
    }
  }
  const firstVerticalValue = Math.floor(scrollY / scale / majorStep) * majorStep;
  for (
    let value = firstVerticalValue;
    value * scale - scrollY < viewportHeight;
    value += majorStep / 2
  ) {
    const position = value * scale - scrollY;
    const major = value % majorStep === 0;
    verticalMarks.push(
      <line
        key={`tick-${value}`}
        y1={position}
        y2={position}
        x1={major ? 13 : 16}
        x2={RULER_SIZE}
        stroke="#5E5E5E"
      />
    );
    if (major) {
      verticalMarks.push(
        <text
          key={`label-${value}`}
          x={11}
          y={position - 3}
          className="rtext"
          transform={`rotate(-90 11 ${position - 3})`}
        >
          {value}
        </text>
      );
    }
  }

  // 带操作手柄的选框向标尺投影，保留原站的蓝色区间与起点坐标。
  for (const cursor of engine.cursors) {
    if (!cursor.ov) continue;
    let selectionIndex = 0;
    for (const overlay of cursor.ov()) {
      if (overlay.t !== "box" || !overlay.handles) continue;
      const left = offsetX + overlay.b.x * scale;
      const right = offsetX + (overlay.b.x + overlay.b.w) * scale;
      const top = overlay.b.y * scale - scrollY;
      const bottom = (overlay.b.y + overlay.b.h) * scale - scrollY;
      const key = `selection-${cursor.id}-${selectionIndex++}`;
      horizontalMarks.unshift(
        <rect
          key={key}
          x={left}
          y={0}
          width={right - left}
          height={RULER_SIZE}
          fill={SELECTION_FILL}
        />
      );
      horizontalMarks.push(
        <text key={`${key}-label`} x={left + 3} y={11} className="rtext rsel">
          {Math.round(overlay.b.x)}
        </text>
      );
      verticalMarks.unshift(
        <rect
          key={key}
          y={top}
          x={0}
          height={bottom - top}
          width={RULER_SIZE}
          fill={SELECTION_FILL}
        />
      );
    }
  }

  // 拖动参考线时实时显示它在设计坐标中的位置。
  for (const element of engine.list) {
    if (element.kind !== ElementKind.GUIDE || !element.dragging) continue;
    if (element.axis === "x") {
      const position = offsetX + element.cur * scale;
      horizontalMarks.push(
        <line
          key={`guide-${element.id}`}
          x1={position}
          x2={position}
          y1={0}
          y2={RULER_SIZE}
          stroke={GUIDE_COLOR}
        />
      );
      horizontalMarks.push(
        <text
          key={`guide-label-${element.id}`}
          x={position + 4}
          y={11}
          className="rtext"
          fill={GUIDE_COLOR}
        >
          {Math.round(element.cur)}
        </text>
      );
    } else {
      const position = element.cur * scale - scrollY;
      verticalMarks.push(
        <line
          key={`guide-${element.id}`}
          y1={position}
          y2={position}
          x1={0}
          x2={RULER_SIZE}
          stroke={GUIDE_COLOR}
        />
      );
    }
  }

  return (
    <>
      <div
        className="ruler ruler-top"
        style={{ transform: `translateY(${(progress - 1) * 100}%)` }}
        aria-hidden="true"
      >
        <svg width={viewportWidth} height={RULER_SIZE}>
          {horizontalMarks}
        </svg>
      </div>
      <div
        className="ruler ruler-left"
        style={{ transform: `translateX(${(progress - 1) * 100}%)` }}
        aria-hidden="true"
      >
        <svg width={RULER_SIZE} height={viewportHeight}>
          {verticalMarks}
        </svg>
      </div>
      <div className="ruler-corner" style={{ opacity: progress }} aria-hidden="true" />
    </>
  );
}
