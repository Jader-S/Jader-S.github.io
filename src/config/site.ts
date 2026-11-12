/**
 * Site-wide configuration. Brand / planets / palette live here.
 * Change `BRAND` to rebrand in one place.
 */
import type { PlanetId } from '@/state/useStore';

export const BRAND = 'ASTRA';

/**
 * 联络方式集中配置（「ECHO 联络星」使用）。
 *
 * 微信添加好友统一走「官方二维码原图 + 微信号」两条 100% 可用的路径：
 *  - wechatQrImage：微信「我 → 我的二维码」保存的图片，放 public/textures/。
 *    电脑端直接展示原图；手机端可保存 / 截图后用「扫一扫 → 相册」识别。
 *  - wechatId：展示 + 一键复制，在微信「添加朋友」中搜索添加。
 *
 * wechatCardUrl 是那张二维码内部编码的 https://u.wechat.com/... 链接，现在只用于
 * 手机端「在微信中打开」按钮尝试由系统唤起微信。实测：在外部浏览器打开会跳微信
 * 下载页，所以它不作为可复制 / 可分享内容，也不用于生成二维码。留空则主按钮
 * 自动退化为「复制微信号」。
 * 注意：weixin://dl/addfriend 这类 scheme 微信官方不支持，别用。
 *
 * ⚠️ 占位值全部换成真实信息后，页面上的演示提示条会自动消失。
 */
export interface ContactConfig {
  wechatId: string;
  wechatCardUrl: string;
  wechatQrImage: string;
  phone: string;
  phoneTel: string;
  email: string;
}

export const CONTACT: ContactConfig = {
  /** 微信号（显示 / 复制；无链接时作为二维码兜底内容）。留空则页面隐藏该行 */
  wechatId: 'Jader-17604617570',
  /** 可选：手机端尝试唤起微信；外部浏览器打开会跳下载页，勿用于复制 / 分享 */
  wechatCardUrl: 'https://u.wechat.com/MK-2LVDqQ7CjbwNPnSFgWCI?s=3',
  /** 微信官方二维码原图（已裁剪成带静区的正方形，位于 public/textures/） */
  wechatQrImage: '/textures/wechat-qr.png',
  /** 电话（展示用，可带空格 / 区号） */
  phone: '176 0461 7570',
  /** tel: 拨号用，纯数字 */
  phoneTel: '17604617570',
  /** 邮箱（留空则不展示） */
  email: '',
};

export const TAGLINE = {
  zh: '一个前端工程师的太空站',
  en: 'A frontend engineer\u2019s space station',
} as const;

export interface PlanetConfig {
  id: PlanetId;
  name: string;          // latin
  label: { zh: string; en: string }; // HUD chip
  description: { zh: string; en: string };
  /** Position in galaxy (galaxy units, roughly -30..30) */
  position: [number, number, number];
  /** Base radius (visual only — does not affect hit detection) */
  radius: number;
  /** Hex color for the planet emissive */
  color: string;
  /** Whether the planet can be navigated to in MVP */
  unlocked: boolean;
  /** Content route after flight lands */
  route: string;
  /** HUD chip position hint, degrees around the orbit */
  angle: number;
}

/**
 * MVP 行星：嵌入螺旋星系盘面内部（星系局部坐标，半径 R 为到星系中心距离）。
 * 尺寸刻意做小（0.2~0.3，仅比粒子略大），跟随星系差速公转。
 * position 为星系局部坐标 [x, y(盘面厚度), z]，由 Planet 组件按差速公式驱动公转。
 */
export const PLANETS: PlanetConfig[] = [
  {
    id: 'about',
    name: 'ORIGO',
    label: { zh: '起源', en: 'About' },
    description: {
      zh: '关于本站主人、他的履历与坐标。',
      en: 'About the station\u2019s operator and coordinates.',
    },
    position: [4.7, 0.25, 1.71],
    radius: 0.24,
    color: '#22d3ee',
    unlocked: true,
    route: '/about',
    angle: 20,
  },
  {
    id: 'projects',
    name: 'ARTIFEX',
    label: { zh: '作品', en: 'Projects' },
    description: {
      zh: '从航天产线到智慧配电的实战记录。',
      en: 'Field log: from factory line to smart distribution.',
    },
    position: [-2.39, 0, 6.58],
    radius: 0.27,
    color: '#a855f7',
    unlocked: true,
    route: '/projects',
    angle: 110,
  },
  {
    id: 'demos',
    name: 'FORGE',
    label: { zh: '实验室', en: 'Forge' },
    description: {
      zh: '优化前后对比、Shader、AI 生成的实验场。',
      en: 'Before/after benchmarks, shaders, AI generations.',
    },
    position: [-6.93, 0, -4.0],
    radius: 0.24,
    color: '#f59e0b',
    unlocked: true,
    route: '/demos',
    angle: 210,
  },
  {
    id: 'blog',
    name: 'LOGOS',
    label: { zh: '日志', en: 'Log' },
    description: {
      zh: '思考、笔记、阶段性复盘。',
      en: 'Notes, musings, post-mortems.',
    },
    position: [4.6, 0, -3.86],
    radius: 0.21,
    color: '#10b981',
    unlocked: true,
    route: '/blog',
    angle: 320,
  },
  {
    id: 'contact',
    name: 'ECHO',
    label: { zh: '联络', en: 'Contact' },
    description: {
      zh: '微信 / 电话，直接连上我。',
      en: 'WeChat / phone — reach me directly.',
    },
    position: [-4.6, 0, 3.6],
    radius: 0.23,
    color: '#ff4d8d',
    unlocked: true,
    route: '/contact',
    angle: 160,
  },
  {
    id: 'home',
    name: 'ASTRA PRIME',
    label: { zh: '母星', en: 'Prime' },
    description: {
      zh: '回到全景视图。',
      en: 'Return to the overview.',
    },
    position: [5.0, 0, -8.66],
    radius: 0.3,
    color: '#f0f9ff',
    unlocked: true,
    route: '/',
    angle: 300,
  },
];

export const QUALITY_TIERS = ['ultra', 'high', 'med', 'low'] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];

export const QUALITY_PARTICLES: Record<QualityTier, number> = {
  ultra: 6000,
  high: 3500,
  med: 1800,
  low: 900,
};

export const FLIGHT_DURATION_MS = 1800;

/* ── 相机初始视口（V2：拉近，让行星像一组导航菜单） ───────────────── */
/** 桌面：贴近盘面，行星占屏从 ~1.5% 提到 ~4%。 */
export const CAMERA_HOME_POS: [number, number, number] = [0, 4.5, 13];
/** 竖屏：后撤 + 加宽 fov，把 4 颗行星连标签一起收进 ~390px 窄屏。
 *  标签是固定像素尺寸（不随距离缩放），所以拉远不会让 chip 变小。 */
export const CAMERA_HOME_POS_PORTRAIT: [number, number, number] = [0, 6, 22];
export const CAMERA_FOV = 55;
/** 84 而非 80：给最左/最右 chip 各留 ~16px 余量，脉冲引导环与公转位移都不削边。 */
export const CAMERA_FOV_PORTRAIT = 84;
/** 星球间直跳（HOP）时长，短于首次俯冲。 */
export const FLIGHT_HOP_MS = 1300;
/** 观察位相对星球的偏移。 */
export const VIEW_OFFSET: [number, number, number] = [0, 0.3, 2.2];
/** HOP 弧线控制点：抬升高度 + 侧向偏移，避免穿过星系核心。 */
export const HOP_ARC_LIFT = 3.5;
export const HOP_ARC_SWAY = 2.5;

/* ── V3 动效常量（1A/2A/3A）─────────────────────────────────────────
 * 运动还给背景层，hover 与相机解耦；返航 tween 独立于状态机 duration
 * （flightMachine.test.ts 断言 1800，故 FLIGHT_DURATION_MS 保持不动）。 */
/** 返航相机 tween 时长（比俯冲略利落；状态机 duration 仍为 1800）。 */
export const FLIGHT_RETURN_MS = 1400;
/** 星系粒子差速自转速度（外圈约 25s/圈；V2 为 0.14 ≈ 40s）。 */
export const GALAXY_SPIN_SPEED = 0.22;
/** 星系盘面整体缓慢公转 rad/s（只作用于粒子盘面，不含行星）。 */
export const GALAXY_ORBIT_SPEED = 0.012;
/** 盘面倾角呼吸幅度 rad 与频率。 */
export const GALAXY_BREATH_AMP = 0.06;
export const GALAXY_BREATH_FREQ = 0.05;
/** 远景星空壳公转 rad/s（V2 为 0.004）。 */
export const GALAXY_SKY_SPIN = 0.008;