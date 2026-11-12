import { FontKind } from "./theme.js";

const textMeasureCache = new Map();
let measureContext;

/**
 * 获取文字样式对应的CSS字体栈，供DOM渲染和Canvas测量共用。
 * @param {import("./theme.js").TextStyle} style 文字样式。
 * @returns {string} CSS font-family值。
 */
export function fontFamily(style) {
  // 测量与展示必须使用同一字体栈，避免选框宽度与文字实际宽度不一致。
  return style.font === FontKind.MONO
    ? '"IBM Plex Mono", ui-monospace, monospace'
    : '"Space Grotesk", "Noto Sans SC", "Source Sans 3", system-ui, sans-serif';
}

/**
 * 计算整数像素行高，允许施工动画使用临时字号进行测量。
 * @param {import("./theme.js").TextStyle} style 文字样式。
 * @param {number} [size] 当前字号，默认采用样式字号。
 * @returns {number} 设计坐标中的行高。
 */
export function lineHeight(style, size = style.size) {
  // 与原站的逐字输入、字号增长和选框计算保持相同取整规则。
  return Math.round(size * style.lh);
}

/**
 * 按原站的空格换行规则测量文字，返回布局尺寸和逐行宽度。
 * @param {string} text 当前已输入或完整的文字内容。
 * @param {import("./theme.js").TextStyle} style 文字样式。
 * @param {number} size 当前字号。
 * @param {number} [width] 文字容器宽度；省略时按最长行宽度确定尺寸。
 * @returns {{w:number,h:number,lines:number[]}} 设计坐标中的边界和每行宽度。
 */
export function measureText(text, style, size, width) {
  // 行高及空白保留规则加入缓存键，防止不同样式误用相同测量结果。
  const cacheKey = `${text}|${style.font}|${style.weight}|${size}|${
    style.ls ?? 0
  }|${style.lh}|${Boolean(style.pre)}|${width ?? -1}`;
  const cached = textMeasureCache.get(cacheKey);
  if (cached) return cached;

  // 延迟创建测量画布，模块本身仅提供函数，不需要挂载额外DOM节点。
  measureContext ??= document.createElement("canvas").getContext("2d");
  if (!measureContext) throw new Error("浏览器无法创建文字测量画布");
  measureContext.font = `${style.weight} ${size}px ${fontFamily(style)}`;
  measureContext.letterSpacing = `${(style.ls ?? 0) * size}px`;
  const lineWidths = [];

  // 显式换行先拆段；代码保留空白，普通正文在指定宽度内按单词折行。
  for (const paragraph of text.split("\n")) {
    if (width == null || style.pre) {
      lineWidths.push(measureContext.measureText(paragraph).width);
      continue;
    }
    let currentLine = "";
    for (const word of paragraph.split(" ")) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (currentLine && measureContext.measureText(candidate).width > width) {
        lineWidths.push(measureContext.measureText(currentLine).width);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    }
    lineWidths.push(measureContext.measureText(currentLine).width);
  }

  const measured = {
    w: Math.ceil(width ?? Math.max(0, ...lineWidths)),
    h: lineWidths.length * lineHeight(style, size),
    lines: lineWidths,
  };
  textMeasureCache.set(cacheKey, measured);
  return measured;
}
