import React from "react";
import { CursorShape } from "../animation/config.js";

/** 不同工具的点击热点，与施工引擎中的实际坐标一致。 */
const HOTSPOTS = {
  [CursorShape.ARROW]: [5, 3.5],
  [CursorShape.DUPLICATE]: [5, 3.5],
  [CursorShape.PEN]: [3, 3],
  [CursorShape.PEN_ADD]: [3, 3],
  [CursorShape.PEN_CLOSE]: [3, 3],
  [CursorShape.CROSS]: [12, 12],
  [CursorShape.TEXT]: [12, 12],
  [CursorShape.RESIZE_X]: [12, 12],
  [CursorShape.RESIZE_Y]: [12, 12],
};
const ARROW_PATH =
  "M4.6 3.9 C4.2 3.1 4.9 2.4 5.7 2.8 L20.6 9.4 C21.5 9.8 21.4 11.1 20.4 11.3 L13.9 12.9 C13.4 13 13 13.4 12.9 13.9 L11.3 20.4 C11.1 21.4 9.8 21.5 9.4 20.6 Z";
const TEXT_PATH =
  "M8.5 4.5 H10.5 Q12 4.5 12 6 Q12 4.5 13.5 4.5 H15.5 M12 6 V18 M8.5 19.5 H10.5 Q12 19.5 12 18 Q12 19.5 13.5 19.5 H15.5";

/**
 * 绘制当前工具的矢量形状，覆盖选择、复制、钢笔、文字和缩放工具。
 * @param {{shape:string,color:string}} props 工具类型与工人颜色。
 * @returns {React.ReactNode} SVG中的工具图形。
 */
function ToolShape({ shape, color }) {
  // 使用同一套描边参数，切换工具时保持原站的边缘粗细和视觉重心。
  const outline = { stroke: "#fff", strokeWidth: 1.5, strokeLinejoin: "round" };
  switch (shape) {
    case CursorShape.ARROW:
      return <path d={ARROW_PATH} fill={color} {...outline} />;
    case CursorShape.DUPLICATE:
      return (
        <>
          <path
            d={ARROW_PATH}
            transform="translate(4 3.5)"
            fill="#fff"
            stroke={color}
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
          <path d={ARROW_PATH} fill={color} {...outline} />
        </>
      );
    case CursorShape.PEN:
    case CursorShape.PEN_ADD:
    case CursorShape.PEN_CLOSE:
      return (
        <>
          <path
            d="M17.4 10.6 L20.6 13.8 L13.8 20.6 L10.6 17.4 Z"
            fill={color}
            {...outline}
          />
          <path
            d="M3 3 L13.1 6.3 L17.4 10.6 L10.6 17.4 L6.3 13.1 Z"
            fill={color}
            {...outline}
          />
          <path
            d="M3.6 3.6 L8.9 8.9"
            stroke="#fff"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <circle
            cx={10.2}
            cy={10.2}
            r={1.75}
            fill="none"
            stroke="#fff"
            strokeWidth={1.2}
          />
          {shape === CursorShape.PEN_ADD && (
            <g strokeLinecap="round">
              <path d="M23 19.5 V26.5 M19.5 23 H26.5" stroke="#fff" strokeWidth={3.4} />
              <path
                d="M23 19.5 V26.5 M19.5 23 H26.5"
                stroke="#1E1E1E"
                strokeWidth={1.3}
              />
            </g>
          )}
          {shape === CursorShape.PEN_CLOSE && (
            <>
              <circle
                cx={23}
                cy={23}
                r={2.8}
                fill="none"
                stroke="#fff"
                strokeWidth={3.2}
              />
              <circle
                cx={23}
                cy={23}
                r={2.8}
                fill="none"
                stroke="#1E1E1E"
                strokeWidth={1.2}
              />
            </>
          )}
        </>
      );
    case CursorShape.CROSS:
      return (
        <g strokeLinecap="round">
          <path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke="#fff" strokeWidth={3.6} />
          <path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke={color} strokeWidth={1.5} />
        </g>
      );
    case CursorShape.TEXT:
      return (
        <g fill="none" strokeLinecap="round">
          <path d={TEXT_PATH} stroke="#fff" strokeWidth={3.6} />
          <path d={TEXT_PATH} stroke={color} strokeWidth={1.5} />
        </g>
      );
    case CursorShape.RESIZE_X:
    case CursorShape.RESIZE_Y:
      return (
        <path
          d="M2.5 12 L7 7.5 V10.4 H17 V7.5 L21.5 12 L17 16.5 V13.6 H7 V16.5 Z"
          transform={shape === CursorShape.RESIZE_Y ? "rotate(90 12 12)" : undefined}
          fill={color}
          {...outline}
        />
      );
    default:
      return null;
  }
}

/**
 * 显示一个工人光标，点击压缩和旋转围绕当前工具热点进行。
 * @param {{cursor:object,x:number,y:number}} props 工人状态及已换算的屏幕坐标。
 * @returns {React.ReactElement} 定位后的光标。
 */
export function Cursor({ cursor, x, y }) {
  // 外层承担位移，内层承担工具旋转和点击，避免热点随图形尺寸漂移。
  const [hotspotX, hotspotY] = HOTSPOTS[cursor.shape];
  const pressedScale = 1 - cursor.press * 0.12;
  return (
    <div
      className="cursor"
      data-agent-id={cursor.id}
      data-tool={cursor.shape}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg
        width={28}
        height={28}
        viewBox="0 0 28 28"
        style={{
          transform: `translate(${-hotspotX}px, ${-hotspotY}px) rotate(${
            cursor.angle
          }deg) scale(${pressedScale})`,
          transformOrigin: `${hotspotX}px ${hotspotY}px`,
        }}
      >
        <ToolShape shape={cursor.shape} color={cursor.color} />
      </svg>
    </div>
  );
}

/**
 * 绘制全部工人，导航施工光标额外叠加吸顶偏移。
 * @param {{engine:object}} props 当前动画引擎。
 * @returns {React.ReactElement} 独立的光标展示层。
 */
export function CursorLayer({ engine }) {
  // 工人使用设计坐标；实际显示统一应用画布缩放与水平居中偏移。
  const { s: scale, left } = engine.vp;
  return (
    <div
      className="cursors"
      aria-hidden="true"
      style={{ height: engine.height * scale }}
    >
      {engine.cursors.map((cursor) => (
        <Cursor
          key={cursor.id}
          cursor={cursor}
          x={left + cursor.x * scale}
          y={(cursor.y + (cursor.sticky ? engine.stick : 0)) * scale}
        />
      ))}
    </div>
  );
}
