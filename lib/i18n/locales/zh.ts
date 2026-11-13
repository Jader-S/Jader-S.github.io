import type { LocaleMessages } from "../types";

/**
 * 中英文文案。内容源：site-content.yaml
 * 同步自 E:\Jader\blog\src\i18n\zh.ts 的履历 / 作品 / 技术栈，
 * 以及 src\content\blog\*.mdx 的 15 篇日志。
 * data/* 里的每个 id 都必须在 zh.ts 与 en.ts 各有一份文案。
 */
export const zh: LocaleMessages = {
  meta: {
    title: "孙珺宇 Jader | 高级前端工程师",
    description:
      "孙珺宇（Jader）— 7 年前端工程师，专注性能治理与架构重构、数字孪生、复杂数据可视化与 AI 工程。现任施耐德电气前端技术负责人。",
  },
  common: {
    skipLink: "跳到主要内容",
    backToTop: "回到顶部",
    viewRepo: "查看仓库",
    readMore: "阅读全文",
    featured: "精选",
    hot: "热门",
    visitGithub: "访问 GitHub",
    yearsExp: "年前端开发经验",
    yearsExpShort: "年经验",
    footerTech: "Next.js · UnoCSS · ASTRA",
  },
  nav: [
    { href: "#selected", label: "精选" },
    { href: "#about", label: "关于" },
    { href: "#work", label: "作品" },
    { href: "#skills", label: "技能" },
    { href: "#blog", label: "博客" },
    { href: "#experience", label: "领域" },
  ],
  navClassic: [
    { href: "#about", label: "关于" },
    { href: "#skills", label: "技能" },
    { href: "#enterprise", label: "企业精选" },
    { href: "#github", label: "开源项目" },
    { href: "#blog", label: "博客" },
    { href: "#experience", label: "经验领域" },
  ],
  navAria: {
    main: "主导航",
    footer: "页脚导航",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
  },
  hero: {
    role: "高级前端工程师 · AI 应用",
    viewResume: "查看履历",
    github: "GitHub",
  },
  profile: {
    name: "孙珺宇 · Jader",
    title: "高级前端工程师 / AI 应用工程师",
    tagline: "一个前端工程师的太空站 · 性能治理 · 数字孪生 · AI 工程",
    highlights: [
      { label: "前端经验", value: "7 年" },
      { label: "核心项目", value: "3 段实战" },
      { label: "技术文章", value: "15 篇" },
      { label: "双栈主力", value: "Vue + React" },
    ],
  },
  about: {
    index: "01 — ABOUT",
    title: "关于我",
    subtitle: "从航天产线到智慧配电，再到把 AI 写进工程流",
    headline: "把复杂业务做成",
    headlineHighlight: "可量化、可复用",
    headlineEnd: "的前端系统",
    location: "中国 · 北京",
    summary: [
      "7 年复杂 B/S 系统前端经验，黑龙江大学软件工程本科（2019）。从联夯的航天产线数字孪生，到氪邦的智慧办公平台，再到施耐德电气的中低压配电系统，一直做从 0 到 1 与大型重构。",
      "当前主线是性能治理与架构重构：POI ConfigTools 配电树 72s → 2.1s（34×）、页面跳转 14s → 1.2s（12×）、JS Heap 4GB OOM 归零；并把关键链路打点、热点分层、单一树 + 节点索引这套方法沉淀成可复用范式。",
      "同时把 GitHub Copilot 从个人工具变成团队能力（人效 +70%），落地五层 AI 协作体系，并用 LangGraph / 自研 MCP Server / Skills 做有状态的 Agent 工程。这个站点本身就是一条可点开的作品线索。",
    ],
  },
  skills: {
    index: "02 — SKILLS",
    title: "技术栈",
    subtitle: "从航天产线到智慧配电，沉淀下来的工程能力",
    featuredDesc: "双栈主力，覆盖性能治理、可视化与 AI 工程全链路",
    categories: {
      coreFrameworks: {
        name: "核心框架",
        skills: {
          react18: "React 18",
          vue23: "Vue 2/3",
          typescript: "TypeScript",
          r3f: "React Three Fiber",
          zustand: "Zustand",
        },
      },
      buildTools: {
        name: "构建与工程化",
        skills: {
          vite: "Vite",
          webpack: "Webpack",
          eslint: "ESLint",
          vitest: "Vitest",
          mdx: "MDX",
        },
      },
      dataVisualization: {
        name: "数据可视化与 3D",
        skills: {
          threeJs: "Three.js",
          echarts: "ECharts",
          svg: "SVG",
          gsap: "GSAP",
          canvas: "Canvas / GLSL",
        },
      },
      performance: {
        name: "性能治理",
        skills: {
          profiling: "PerformanceObserver 打点",
          rendering: "渲染链路优化",
          memory: "内存 / OOM 定位",
          virtualization: "虚拟滚动 / 懒加载",
        },
      },
      aiEngineering: {
        name: "AI 工程与 Agent",
        skills: {
          langgraph: "LangGraph",
          mcp: "MCP Server",
          aiAgent: "ReAct / Tool Calling",
          copilot: "Copilot 团队赋能",
          sse: "SSE / WebSocket 流式",
        },
      },
      backend: {
        name: "后端协作与全栈",
        skills: {
          fastapi: "FastAPI",
          postgresql: "PostgreSQL",
          sqlalchemy: "SQLAlchemy / Alembic",
          docker: "Docker / CI-CD",
          pytest: "pytest",
        },
      },
      industrial: {
        name: "工业互联网与实时",
        skills: {
          digitalTwin: "Three.js 数字孪生",
          signalr: "SignalR",
          websocket: "WebSocket",
          industrialProtocols: "Modbus / IEC 61850",
        },
      },
      practices: {
        name: "工程实践",
        skills: {
          git: "Git",
          cicd: "CI/CD",
          designDocs: "ADR / 设计文档",
          unitTesting: "单元测试",
          codeReview: "Code Review",
        },
      },
    },
  },
  enterprise: {
    index: "03 — ENTERPRISE",
    title: "近期企业项目",
    subtitle: "公司实战：性能治理、B 端 SaaS 与航天产线数字孪生",
    projects: {
      poiConfigTools: {
        name: "施耐德 · POI 中低压配电",
        description:
          "Power Operation Insight 核心配置工具，管理万点级中低压配电系统。主导性能治理与架构重构：配电树 72s→2.1s（34×）、页面跳转 14s→1.2s、OOM 归零；落地单线图 SVG 电流动画、DER 实时方向判定、POAE 看板 Vue→React 迁移，以及五层 AI 协作体系（团队人效 +70%）。",
      },
      smartMeeting: {
        name: "氪邦 · 智慧会议子系统",
        description:
          "企业级会议全流程管控：会议室资源池与状态屏协同、智能排期、会中控屏与议题汇报。独立开发待办督办、会议纪要、电子席卡等核心模块，抽离通用组件体系使团队效率提升 30%+，并适配大屏 / 中屏 / 小屏多硬件分辨率。",
      },
      aerospaceLine: {
        name: "联夯 · 首都航天机械产线",
        description:
          "B/S 架构自动化产线管控系统，配合机床与机器人实现全自动运行。从 0 到 1 搭建前端架构、封装 Axios / WebSocket 通信；用 Three.js 把物理产线 1:1 实时映射到浏览器（模型轻量化 + LOD + 帧率优化），并落地 SVG / ECharts 全流程可视化与自定义权限体系。",
      },
    },
  },
  github: {
    index: "04 — OPEN SOURCE",
    title: "开源项目",
    subtitle: "个人开源与作品站，都能点进去看真实实现",
    projects: {
      astraPortfolio: {
        name: "ASTRA · 3D 星图作品站",
        description:
          "一个前端工程师的太空站：9 万粒子螺旋星系、飞行式星球导航、可交互 Demo 与 MDX 技术日志。基于 Vite + React + R3F + Zustand 构建的纯静态作品站。",
      },
      skillQaAgent: {
        name: "技能问答 Agent · Skill QA",
        description:
          "本地优先的学习与面试助手：把课程资料整理成知识点，按章节自测，再用同一份知识库做模拟面试。网页版数据全部落在浏览器（sql.js WASM + IndexedDB），未配置 API Key 时自动以 Mock 离线模式运行。",
      },
    },
  },
  blog: {
    index: "05 — BLOG",
    title: "技术日志",
    subtitle: "ASTRA 日志：前端工程化、Agent 运行时与实战复盘",
    allPosts: "全部日志",
    close: "关闭",
    notFound: "找不到这篇日志。",
    emptyBody: "正文尚未生成，请运行 npm run gen:blog-content。",
    postCount: (count: number) => `共 ${count} 篇`,
  },
  experience: {
    index: "06 — DOMAINS",
    title: "经验领域",
    subtitle: "7 年职业生涯中深耕的业务方向与技术实践",
    domains: {
      performance: {
        title: "性能治理与架构重构",
        description:
          "关键链路打点 → 热点分层拆解 → 单一树 + 节点索引 Map + UUID 事务回滚。配电树 34× 提速、跳转 12× 提速、4GB Heap OOM 归零。",
      },
      digitalTwin: {
        title: "数字孪生与工业互联网",
        description:
          "航天产线 1:1 实时映射、机床与机器人协同、模型轻量化与 LOD；Modbus / IEC 61850 业务语义与 SignalR 实时驱动。",
      },
      smartOffice: {
        title: "智慧办公与 B 端 SaaS",
        description:
          "会议全流程管控、待办督办、电子席卡与多端适配；通用组件体系让团队开发效率提升 30%+。",
      },
      powerSystems: {
        title: "智慧配电",
        description:
          "中低压配电树、单线图 SVG 电流动画、DER 实时方向判定、POAE 自定义看板与运行时抄表能耗可视化。",
      },
      aiEngineering: {
        title: "AI 工程与 Agent",
        description:
          "五层 AI 协作体系（规则 / Skill / Memory / 代理路由）、LangGraph 有状态编排、自研 MCP Server、SSE 流式对话；Copilot 团队人效 +70%。",
      },
      visualization: {
        title: "复杂数据可视化",
        description:
          "ECharts 万点级时序与像素放大镜、数据大屏、OEE / 设备健康度看板，以及自研 GLSL 星系着色器。",
      },
    },
  },
  footer: {
    about: "关于",
    blog: "博客",
  },
  cookie: {
    title: "我们使用 Cookie",
    description:
      "为保障网站正常运行、记住您的主题偏好并了解访问情况，我们会使用必要 Cookie 及类似技术。您可以选择全部接受，或拒绝非必要 Cookie；拒绝后不影响浏览本站内容。",
    accept: "全部接受",
    reject: "全部拒绝",
  },
  theme: {
    light: "浅色",
    dark: "深色",
    auto: "跟随系统",
    ariaLabel: "主题模式",
  },
  style: {
    atelier: "静奢",
    classic: "经典",
    particle: "粒子",
    blueprint: "蓝图",
    astra: "太空",
    ariaLabel: "页面风格",
    railLabel: "风格",
    drawerTitle: "切换页面风格",
    openMenu: "展开风格切换",
    closeMenu: "收起风格切换",
    current: "当前",
  },
  skillShare: {
    ariaLabel: "复制 Skill 提示词",
    label: "用 AI 生成同款",
    hint: "点击复制当前风格的 Skill 提示词，粘贴到 Cursor 等 AI 里，即可按本站风格生成你的作品集。",
    tooltipTitle: "用 AI 生成同款站点",
    tooltipDoneHint: "已复制到剪贴板，去 AI 对话里粘贴即可。",
    copied: "已复制",
    copyFailed: "复制失败",
  },
  blueprint: {
    replayBuild: "重播共建",
    startHint: "点击或下滑，光标会逐屏把这一页画出来",
    builtBy: "这一页由 {n} 个光标签了名",
    signTitle: "共建完稿",
  },
  locale: {
    zh: "中文",
    en: "English",
  },
};
