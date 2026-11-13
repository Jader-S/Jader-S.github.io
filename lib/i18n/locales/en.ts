import type { LocaleMessages } from "../types";

/**
 * English messages. Content source: site-content.yaml
 * Mirrors E:\Jader\blog\src\i18n\zh.ts (career, projects, stack) and
 * the 15 posts in src\content\blog\*.mdx.
 * Every id in data/* must have a matching entry in both zh.ts and en.ts.
 */
export const en: LocaleMessages = {
  meta: {
    title: "Jader Sun | Senior Frontend Engineer",
    description:
      "Jader Sun — frontend engineer with 7 years of experience, focused on performance governance, architecture refactors, digital twins, complex data visualization and AI engineering. Currently frontend tech lead at Schneider Electric.",
  },
  common: {
    skipLink: "Skip to main content",
    backToTop: "Back to top",
    viewRepo: "View repository",
    readMore: "Read more",
    featured: "Featured",
    hot: "Popular",
    visitGithub: "Visit GitHub",
    yearsExp: "years of frontend experience",
    yearsExpShort: "yrs exp",
    footerTech: "Next.js · UnoCSS · ASTRA",
  },
  // Shared nav for all 4 anchored styles; #top is the brand link, work/open-source live in #work.
  nav: [
    { href: "#about", label: "About me" },
    { href: "#work", label: "Work" },
    { href: "#skills", label: "Skills" },
    { href: "#blog", label: "Blog" },
    { href: "#experience", label: "Domains" },
  ],
  navAria: {
    main: "Main navigation",
    footer: "Footer navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    role: "Senior Frontend Engineer · AI",
    viewResume: "View resume",
    github: "GitHub",
  },
  profile: {
    name: "Jader Sun",
    title: "Senior Frontend Engineer / AI Application Engineer",
    tagline:
      "A frontend engineer's space station · performance · digital twins · AI engineering",
    highlights: [
      { label: "Experience", value: "7 yrs" },
      { label: "Core Projects", value: "3" },
      { label: "Articles", value: "15" },
      { label: "Dual Stack", value: "Vue + React" },
    ],
  },
  about: {
    index: "01 — ABOUT",
    title: "About Me",
    subtitle:
      "From aerospace production lines to smart distribution, and AI in the engineering loop",
    headline: "Turning complex business systems into",
    headlineHighlight: "measurable, reusable",
    headlineEnd: "frontend systems",
    location: "Beijing, China",
    summary: [
      "7 years of frontend engineering on complex B/S systems, BS in Software Engineering (Heilongjiang University, 2019). From a 1:1 digital twin of an aerospace production line, to a smart-office platform, to Schneider Electric's low-voltage distribution tooling — always zero-to-one builds and large-scale refactors.",
      "Current focus: performance governance and architecture. POI ConfigTools tree build 72s to 2.1s (34x), page transition 14s to 1.2s (12x), a 4GB heap OOM eliminated. The profiling → hotspot layering → single tree + node index method is now a reusable playbook.",
      "Also turned GitHub Copilot from a personal tool into a team capability (+70% throughput) with a five-layer AI collaboration system, and build stateful agents with LangGraph, self-hosted MCP servers and Skills. This site is itself a clickable project trail.",
    ],
  },
  skills: {
    index: "03 — SKILLS",
    title: "Tech Stack",
    subtitle:
      "Engineering capabilities forged on production lines and power distribution systems",
    featuredDesc:
      "Dual-stack core, spanning performance, visualization and AI engineering",
    categories: {
      coreFrameworks: {
        name: "Core Frameworks",
        skills: {
          react18: "React 18",
          vue23: "Vue 2/3",
          typescript: "TypeScript",
          r3f: "React Three Fiber",
          zustand: "Zustand",
        },
      },
      buildTools: {
        name: "Build & Tooling",
        skills: {
          vite: "Vite",
          webpack: "Webpack",
          eslint: "ESLint",
          vitest: "Vitest",
          mdx: "MDX",
        },
      },
      dataVisualization: {
        name: "Visualization & 3D",
        skills: {
          threeJs: "Three.js",
          echarts: "ECharts",
          svg: "SVG",
          gsap: "GSAP",
          canvas: "Canvas / GLSL",
        },
      },
      performance: {
        name: "Performance",
        skills: {
          profiling: "PerformanceObserver Profiling",
          rendering: "Render Pipeline Tuning",
          memory: "Memory & OOM Analysis",
          virtualization: "Virtualization & Lazy Loading",
        },
      },
      aiEngineering: {
        name: "AI Engineering & Agents",
        skills: {
          langgraph: "LangGraph",
          mcp: "MCP Server",
          aiAgent: "ReAct / Tool Calling",
          copilot: "Copilot Team Enablement",
          sse: "SSE / WebSocket Streaming",
        },
      },
      backend: {
        name: "Backend & Full Stack",
        skills: {
          fastapi: "FastAPI",
          postgresql: "PostgreSQL",
          sqlalchemy: "SQLAlchemy / Alembic",
          docker: "Docker / CI-CD",
          pytest: "pytest",
        },
      },
      industrial: {
        name: "Industrial & Realtime",
        skills: {
          digitalTwin: "Three.js Digital Twin",
          signalr: "SignalR",
          websocket: "WebSocket",
          industrialProtocols: "Modbus / IEC 61850",
        },
      },
      practices: {
        name: "Engineering Practices",
        skills: {
          git: "Git",
          cicd: "CI/CD",
          designDocs: "ADR / Design Docs",
          unitTesting: "Unit Testing",
          codeReview: "Code Review",
        },
      },
    },
  },
  enterprise: {
    index: "02 — WORK",
    title: "Recent Enterprise Projects",
    subtitle:
      "Production work: performance governance, B2B SaaS and an aerospace digital twin",
    projects: {
      poiConfigTools: {
        name: "Schneider · POI ConfigTools",
        description:
          "Core configuration tool for Power Operation Insight, handling 10k+ point low-voltage distribution systems. Led performance governance: tree build 72s to 2.1s (34x), page transition 14s to 1.2s, OOM eliminated. Delivered SVG current-flow animation, DER direction detection, a Vue-to-React dashboard migration, and a five-layer AI workflow (+70% team throughput).",
      },
      smartMeeting: {
        name: "Kebang · Smart Meeting Suite",
        description:
          "Enterprise meeting lifecycle platform: room resource pools, status screens, smart scheduling, in-meeting control. Built task tracking, minutes and electronic nameplates, extracted a shared component system lifting team efficiency by 30%+, and adapted across large / medium / small screens.",
      },
      aerospaceLine: {
        name: "Lianhang · Aerospace Production Line",
        description:
          "B/S production-line control system driving CNC machines and robots end to end. Built the frontend from scratch, wrapped Axios / WebSocket comms, mirrored the physical line 1:1 in the browser with Three.js (mesh decimation + LOD + frame tuning), and shipped SVG / ECharts dashboards with a custom permission model.",
      },
    },
  },
  github: {
    index: "02 · OPEN SOURCE",
    title: "Open Source Projects",
    subtitle: "Personal projects and a portfolio you can actually click through",
    projects: {
      astraPortfolio: {
        name: "ASTRA · 3D Galaxy Portfolio",
        description:
          "A frontend engineer's space station: a 90k-particle spiral galaxy, fly-to navigation between planets, interactive demos and MDX engineering notes. A static portfolio built with Vite + React + R3F + Zustand.",
      },
      skillQaAgent: {
        name: "Skill QA Agent",
        description:
          "A local-first study and interview assistant: turn course material into knowledge points, self-test by chapter, then run a mock interview on the same knowledge base. All browser data stays local (sql.js WASM + IndexedDB); without an API key it runs fully offline in Mock mode.",
      },
    },
  },
  blog: {
    index: "04 — BLOG",
    title: "Engineering Notes",
    subtitle:
      "ASTRA log: frontend engineering, agent runtimes and post-mortems from the field",
    allPosts: "All posts",
    close: "Close",
    notFound: "Post not found.",
    emptyBody: "Body not generated. Run npm run gen:blog-content.",
    postCount: (count: number) => `${count} posts`,
  },
  experience: {
    index: "05 — DOMAINS",
    title: "Experience Domains",
    subtitle: "Business domains and technical practices honed over 7 years",
    domains: {
      performance: {
        title: "Performance & Architecture",
        description:
          "Instrument the critical path, stratify hotspots, then rebuild around a single tree with a node index and transactional rollback. 34x tree build, 12x navigation, a 4GB heap OOM eliminated.",
      },
      digitalTwin: {
        title: "Digital Twins & Industrial IoT",
        description:
          "1:1 real-time aerospace line mirroring, CNC/robot coordination, mesh decimation and LOD; Modbus / IEC 61850 semantics with SignalR-driven updates.",
      },
      smartOffice: {
        title: "Smart Office & B2B SaaS",
        description:
          "Meeting lifecycle control, task tracking, electronic nameplates and multi-screen adaptation; a shared component system lifted team efficiency by 30%+.",
      },
      powerSystems: {
        title: "Smart Power Distribution",
        description:
          "Low-voltage distribution trees, SVG current-flow single-line diagrams, real-time DER direction detection, POAE dashboards and runtime energy metering.",
      },
      aiEngineering: {
        title: "AI Engineering & Agents",
        description:
          "Five-layer AI collaboration (rules / skills / memory / agent routing), LangGraph stateful orchestration, self-hosted MCP servers, SSE streaming; Copilot drove +70% team throughput.",
      },
      visualization: {
        title: "Complex Data Visualization",
        description:
          "ECharts 10k-point time series with a pixel magnifier, data walls, OEE / equipment health dashboards, and hand-written GLSL galaxy shaders.",
      },
    },
  },
  footer: {
    about: "About",
    blog: "Blog",
  },
  cookie: {
    title: "We Use Cookies",
    description:
      "To keep the site running, remember your theme preferences, and understand visit patterns, we use essential cookies and similar technologies. You can accept all or decline non-essential cookies — declining does not affect browsing.",
    accept: "Accept All",
    reject: "Reject All",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    auto: "System",
    ariaLabel: "Theme mode",
  },
  style: {
    atelier: "Atelier",
    classic: "Classic",
    particle: "Particle",
    blueprint: "Blueprint",
    astra: "ASTRA",
    ariaLabel: "Page style",
    railLabel: "Style",
    drawerTitle: "Switch page style",
    openMenu: "Open style switcher",
    closeMenu: "Close style switcher",
    current: "Now",
  },
  skillShare: {
    ariaLabel: "Copy skill prompt",
    label: "Build with AI",
    hint: "Click to copy this style's skill prompt. Paste it into Cursor (or another AI) to scaffold a portfolio like this one.",
    tooltipTitle: "Build the same site with AI",
    tooltipDoneHint: "Copied — paste it into your AI chat.",
    copied: "Copied",
    copyFailed: "Copy failed",
  },
  blueprint: {
    replayBuild: "Replay build",
    startHint: "Click or scroll — cursors keep drawing each section",
    builtBy: "Signed by {n} cursors",
    signTitle: "Built together",
  },
  locale: {
    zh: "中文",
    en: "English",
  },
};
