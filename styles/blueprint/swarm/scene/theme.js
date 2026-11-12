/** 页面使用1280像素设计坐标；视口缩放由展示层统一处理。 */
export const PAGE_WIDTH = 1280;
export const NAV_TOP = 24;
export const NAV_HEIGHT = 64;
export const RULER_SIZE = 20;
export const FRAME_LEFT = 80;
export const FRAME_RIGHT = 1200;
export const CONTENT_LEFT = FRAME_LEFT + 36;
export const EDGE_START = -10000;
export const EDGE_END = 10000;

/** 场景文字使用的字体类别，保持与测量层和文本实体协议一致。 */
export const FontKind = Object.freeze({
  SANS: "sans",
  MONO: "mono",
});

const LIGHT_COLORS = {
  ink: "#1A1C1F",
  muted: "#5E646C",
  line: "#D5D8DE",
  accent: "#0D99FF",
  card: "#FFFFFF",
  solid: "#1A1C1F",
  onSolid: "#FFFFFF",
  track: "#E1E3E6",
  stem: "#9DA2A9",
  dim: "#8F949B",
  wash: "#F3F9FF",
  code: "#1E1E1E",
};

const DARK_COLORS = {
  ink: "#E8ECF1",
  muted: "#8B93A1",
  line: "#2C3846",
  accent: "#5EB8C6",
  card: "#16202A",
  solid: "#E8ECF1",
  onSolid: "#0E141B",
  track: "#24303C",
  stem: "#6A727C",
  dim: "#8B93A1",
  wash: "#16303A",
  code: "#0A0E12",
};

/** 页面颜色集中配置；绘制前按当前主题写入。 */
export const COLORS = { ...LIGHT_COLORS };

/**
 * @typedef {object} TextStyle
 * @property {string} font 字体类别，对应FontKind。
 * @property {number} size 字号，单位为设计坐标像素。
 * @property {number} weight 字重。
 * @property {number} lh 行高相对于字号的倍率。
 * @property {string} color 文字颜色。
 * @property {number} [ls] 字间距，单位为em。
 * @property {boolean} [pre] 是否保留空白并禁止自动换行。
 * @property {boolean} [code] 是否进行代码语法着色。
 * @property {boolean} [upper] 是否将文案转换为大写。
 */

/**
 * 创建无衬线文字样式，供标题、正文和按钮等区块复用。
 * @param {number} size 字号。
 * @param {number} weight 字重。
 * @param {number} lineHeightRatio 行高倍率。
 * @param {string} [color] 文字颜色。
 * @param {number} [letterSpacing] 以em计的字间距。
 * @returns {TextStyle} 可被场景实体与Canvas测量共用的样式。
 */
export function sansStyle(
  size,
  weight,
  lineHeightRatio,
  color = COLORS.ink,
  letterSpacing = 0
) {
  // 字间距与行高保留原站设计数值，避免测量层和展示层出现换行偏差。
  return {
    font: FontKind.SANS,
    size,
    weight,
    lh: lineHeightRatio,
    color,
    ls: letterSpacing,
  };
}

/**
 * 创建等宽文字样式，供代码窗口、节点说明和小标签复用。
 * @param {number} size 字号。
 * @param {string} [color] 文字颜色。
 * @param {number} [weight] 字重。
 * @param {Partial<TextStyle>} [overrides] 对默认行高或代码显示规则的覆盖。
 * @returns {TextStyle} 完整等宽文字样式。
 */
export function monoStyle(size, color = COLORS.muted, weight = 400, overrides = {}) {
  // 代码区允许独立配置行高和空白保留，其余等宽文字沿用默认行高。
  return { font: FontKind.MONO, size, weight, lh: 1.45, color, ...overrides };
}

/** 原站排版层级；区块布局仅引用此表，字号与字重无需分散修改。 */
export const TEXT_STYLES = {};

/**
 * 按已解析的明暗主题刷新场景颜色和文字色。
 * 场景在创建时读取这些对象，切换主题后需要重新挂载才会重画。
 * @param {"light"|"dark"} resolved 当前实际主题。
 */
export function applyScenePalette(resolved) {
  Object.assign(COLORS, resolved === "dark" ? DARK_COLORS : LIGHT_COLORS);
  Object.assign(TEXT_STYLES, {
    h1: sansStyle(64, 600, 1.02, COLORS.ink, -0.035),
    h2: sansStyle(40, 600, 1.08, COLORS.ink, -0.03),
    h3: sansStyle(21, 600, 1.25, COLORS.ink, -0.012),
    lead: sansStyle(19, 400, 1.5, COLORS.muted, -0.005),
    body: sansStyle(15.5, 400, 1.55, COLORS.muted),
    item: sansStyle(14.5, 450, 1.4, COLORS.ink),
    nav: sansStyle(14, 500, 1.4, COLORS.ink),
    btn: sansStyle(14.5, 600, 1.4, COLORS.onSolid),
    btnDark: sansStyle(14.5, 600, 1.4, COLORS.ink),
    logo: sansStyle(19, 650, 1.3, COLORS.muted, -0.025),
    brand: sansStyle(18, 650, 1.3, COLORS.ink, -0.02),
    stat: sansStyle(52, 600, 1, COLORS.ink, -0.04),
    price: sansStyle(44, 600, 1.05, COLORS.ink, -0.035),
    code: monoStyle(13.5, "#E0E2E5", 400, { lh: 1.7, code: true, pre: true }),
    codeDim: monoStyle(12, "#81868D"),
    nodeName: monoStyle(13, COLORS.ink, 500),
    nodeWhite: monoStyle(14, COLORS.onSolid, 500),
    small: monoStyle(12, COLORS.muted),
  });
}

applyScenePalette("light");

/** 标志的矢量轮廓及施工锚点，共用120×140的原始设计坐标。 */
export const LOGO_PATHS = [
  {
    d: "M0 61V70V95.5L16.16 87.6891C17.8793 86.8582 18.3949 84.6538 17.2227 83.1464L0 61Z",
    anchors: [
      [0, 61],
      [0, 95.5],
      [16.2, 87.7],
      [17.2, 83.1],
    ],
  },
  {
    d: "M120 79V70V45L103.54 52.3455C101.748 53.1452 101.194 55.4216 102.417 56.9557L120 79Z",
    anchors: [
      [120, 79],
      [120, 45],
      [103.5, 52.3],
      [102.4, 57],
    ],
  },
  {
    d: "M120 35V5C120 2.23858 117.761 0 115 0H35H20C8.95431 0 0 8.95432 0 20V50.9252L74.5897 101.343C76.2237 102.447 75.442 105 73.4697 105H0V135C0 137.761 2.23858 140 5 140H35H85H100C111.046 140 120 131.046 120 120V89.0748L45.4103 38.657C43.7763 37.5525 44.558 35 46.5303 35H120Z",
    anchors: [
      [120, 35],
      [120, 5],
      [115, 0],
      [20, 0],
      [5.9, 5.9],
      [0, 20],
      [0, 50.9],
      [74.6, 101.3],
      [73.5, 105],
      [0, 105],
      [0, 135],
      [5, 140],
      [100, 140],
      [114.1, 134.1],
      [120, 120],
      [120, 89.1],
      [45.4, 38.7],
      [46.5, 35],
    ],
  },
];
