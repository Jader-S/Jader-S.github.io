import React, { memo } from "react";
import { PAGE_WIDTH } from "../scene/theme.js";
import { ElementKind } from "../scene/types.js";
import { fontFamily, lineHeight } from "../scene/text-metrics.js";

/**
 * 对YAML示例进行轻量着色，保留逐字输入时尚未完整的代码片段。
 * @param {{text:string}} props 当前已显示的代码文本。
 * @returns {React.ReactNode} 彩色文本片段。
 */
function CodeText({ text }) {
  // 注释独立着色，其他行按键名和标点拆分，剩余空白保持原样。
  if (text.trimStart().startsWith("#"))
    return <span style={{ color: "#6B7078" }}>{text}</span>;
  const tokens = [];
  const pattern = /([A-Za-z_]+)(?=:)|([{}:,])|([^{}:,A-Za-z_]+|[A-Za-z_]+)/g;
  let match;
  let firstKey = true;
  while ((match = pattern.exec(text))) {
    if (match[1]) {
      tokens.push(
        <span key={match.index} style={{ color: firstKey ? "#8FC9D6" : "#AEB6EE" }}>
          {match[1]}
        </span>
      );
      firstKey = false;
    } else if (match[2]) {
      tokens.push(
        <span key={match.index} style={{ color: "#81868D" }}>
          {match[2]}
        </span>
      );
    } else tokens.push(match[3]);
  }
  return tokens;
}

/**
 * 根据实体版本判断是否需要重新渲染，兼容引擎对实体对象的原地更新。
 * @param {{version:number}} previous 上一帧快照。
 * @param {{version:number}} next 下一帧快照。
 * @returns {boolean} 版本一致时跳过重新渲染。
 */
function sameVersion(previous, next) {
  // 直接比较可变对象会漏掉字符和坐标更新，因此单独传递数值版本。
  return previous.version === next.version;
}

/**
 * 渲染文本、选中文字和输入光标，字号与测量模块使用相同规则。
 * @param {{element:object}} props 当前文本实体。
 * @returns {React.ReactElement|null} 可见文本节点。
 */
function TextElementView({ element }) {
  // 尚未开始施工的实体不占用DOM显示层，但布局坐标始终由场景数据保留。
  if (!element.vis) return null;
  const style = element.st;
  const content = element.selAll ? (
    <span className="text-sel">{element.shown}</span>
  ) : style.code ? (
    <CodeText text={element.shown} />
  ) : (
    element.shown
  );
  return (
    <div
      className="el-text"
      data-element-id={element.id}
      style={{
        left: element.x + element.dx,
        top: element.y + element.dy,
        width: element.w,
        whiteSpace: element.w != null && !style.pre ? "pre-wrap" : "pre",
        fontFamily: fontFamily(style),
        fontSize: element.size,
        fontWeight: style.weight,
        lineHeight: `${lineHeight(style, element.size)}px`,
        letterSpacing: `${style.ls ?? 0}em`,
        color: style.color,
        textAlign: element.align,
      }}
    >
      {content}
      {element.editing && !element.selAll && (
        <span className="caret" style={{ height: element.size * 1.15 }} />
      )}
    </div>
  );
}

/**
 * 渲染正在拉伸或已完成样式设置的矩形、按钮和卡片。
 * @param {{element:object}} props 当前矩形实体。
 * @returns {React.ReactElement|null} 矩形节点。
 */
function RectangleElementView({ element }) {
  // 拉框阶段使用临时宽高，施工完成后再应用最终填色、圆角和边线。
  if (!element.vis) return null;
  return (
    <div
      className="el-rect"
      data-element-id={element.id}
      style={{
        left: element.x + element.dx,
        top: element.y + element.dy,
        width: element.draw?.w ?? element.w,
        height: element.draw?.h ?? element.h,
        background: element.styled ? element.fill : "#D9D9D9",
        borderRadius: element.styled ? element.r : 0,
        boxShadow:
          element.styled && element.stroke
            ? `inset 0 0 0 1px ${element.stroke}`
            : "none",
      }}
    />
  );
}

/**
 * 根据已经落下的锚点绘制线条或标志，保持钢笔路径的逐段出现过程。
 * @param {{element:object}} props 当前路径实体。
 * @returns {React.ReactElement|null} SVG路径。
 */
function PathElementView({ element }) {
  // 标志使用真实曲线和路径长度控制描边，其余路径沿已放置锚点连接。
  if (!element.vis || element.placed === 0) return null;
  if (element.d && element.tf) {
    const progress = Math.min(1, (element.placed - 1) / element.pts.length);
    return (
      <path
        d={element.d}
        data-element-id={element.id}
        transform={`translate(${element.tf.x} ${element.tf.y}) scale(${element.tf.s})`}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - progress}
        stroke={element.stroke}
        strokeWidth={1.2 / element.tf.s}
        fill={element.fill}
        fillOpacity={element.fillOn ? 1 : 0}
        style={{
          transition: "fill-opacity 220ms ease, stroke-dashoffset 120ms linear",
        }}
      />
    );
  }
  const path =
    element.pts
      .slice(0, element.placed)
      .map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`)
      .join(" ") + (element.shut ? " Z" : "");
  return (
    <path
      d={path}
      data-element-id={element.id}
      stroke={element.stroke}
      strokeWidth={element.sw}
      fill={element.fill ?? "none"}
      fillOpacity={element.fillOn ? 1 : 0}
      style={{ transition: "fill-opacity 220ms ease" }}
      vectorEffect="non-scaling-stroke"
      strokeLinejoin="miter"
      strokeLinecap="square"
    />
  );
}

const TextElement = memo(TextElementView, sameVersion);
const RectangleElement = memo(RectangleElementView, sameVersion);
const PathElement = memo(PathElementView, sameVersion);

/**
 * 按矩形、路径、文字的固定顺序渲染一组场景实体。
 * @param {{elements:object[],height:number}} props 实体集合和设计高度。
 * @returns {React.ReactElement} 完整实体展示层。
 */
export function SceneElements({ elements, height }) {
  // 分层顺序保证边框不会遮住文字，也避免卡片背景覆盖连接线。
  return (
    <>
      {elements
        .filter((element) => element.kind === ElementKind.RECTANGLE)
        .map((element) => (
          <RectangleElement key={element.id} element={element} version={element.v} />
        ))}
      <svg className="paths" width={PAGE_WIDTH} height={height} aria-hidden="true">
        {elements
          .filter((element) => element.kind === ElementKind.PATH)
          .map((element) => (
            <PathElement key={element.id} element={element} version={element.v} />
          ))}
      </svg>
      {elements
        .filter((element) => element.kind === ElementKind.TEXT)
        .map((element) => (
          <TextElement key={element.id} element={element} version={element.v} />
        ))}
    </>
  );
}
