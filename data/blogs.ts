export interface BlogPost {
  title: string;
  description: string;
  url: string;
  likes: number;
  views: number;
  date: string;
}

/**
 * 博客主页。变量名沿用模板的 csdnProfile，但内容源已换成 ASTRA 日志页。
 * 注意：不要再跑 `npm run fetch:blogs`，那个脚本会按模板作者的 CSDN 账号覆盖本文件。
 */
export const csdnProfile = "https://jaderai.cn/blog";

/**
 * 15 篇技术日志，来自 E:\Jader\blog\src\content\blog\*.mdx 的 frontmatter。
 * 没有公开的点赞 / 浏览数据，likes / views 统一为 0；url 指向已上线的 jaderai.cn。
 * 内容源：site-content.yaml → blogs
 */
export const blogPosts: BlogPost[] = [
  {
    title: "在浏览器里复原一条航天产线",
    description:
      "用 Three.js + ECharts 把七八年前做过的数字孪生重做一遍：主题变量桥接、资源清理、让模拟数据活起来，以及我特意没做的事。",
    url: "https://jaderai.cn/blog/rebuilding-a-production-line-in-the-browser",
    likes: 0,
    views: 0,
    date: "2026-11-12",
  },
  {
    title: "把做过的事，变成能点开看的 Demo",
    description:
      "星图搭好了，点进「作品」星球却发现卡片是空的。作品集要回答的不是「我会什么特效」，而是「我解决过什么问题」。",
    url: "https://jaderai.cn/blog/turning-work-into-interactive-demos",
    likes: 0,
    views: 0,
    date: "2026-11-11",
  },
  {
    title: "当鼠标一动，整片星空都在抖",
    description:
      "一天之内连着改了两轮交互：上午修「一眼看过去不对劲」，下午修「改完反而更不对劲」。四个玄学 bug 最后都指向同一件事——交互状态放错了层。",
    url: "https://jaderai.cn/blog/astra-interaction-redesign",
    likes: 0,
    views: 0,
    date: "2026-11-09",
  },
  {
    title: "让 Agent 自己写代码：沙箱、OSS 和多智能体",
    description:
      "沙箱销毁了文件还在、deploy 工具直接返回公网 URL。跨过这一步，Agent 从「回答问题」变成「交付东西」。",
    url: "https://jaderai.cn/blog/coding-agent-sandbox-oss-and-multi-agent",
    likes: 0,
    views: 0,
    date: "2026-10-28",
  },
  {
    title: "写了 deny，.env 还是能读：文件权限的顺序语义",
    description:
      "ACL 按列表顺序匹配、第一条命中即生效、全不中默认允许。宽泛的 allow 写在前面，deny 永远轮不到。",
    url: "https://jaderai.cn/blog/filesystem-permission-first-match-wins",
    likes: 0,
    views: 0,
    date: "2026-10-28",
  },
  {
    title: "Agent 移交成功了，下一轮怎么又跑回默认？",
    description:
      "acitve_agent 少一个字母，不报错、不抛栈，只是每轮静默回落到默认 Agent。写状态和读状态，是一对字节级契约。",
    url: "https://jaderai.cn/blog/handoff-typo-silent-fallback",
    likes: 0,
    views: 0,
    date: "2026-10-28",
  },
  {
    title: "一个 Cursor 窗口、三套 .venv：我是怎么把 Python 环境串烂的",
    description:
      "三类看起来毫不相干的报错，同一个根因：作用域错了。项目目录、解释器、虚拟环境、笔记本内核，四者必须指向同一套。",
    url: "https://jaderai.cn/blog/python-venv-scope-mess",
    likes: 0,
    views: 0,
    date: "2026-10-21",
  },
  {
    title: "从手写 ReAct 到图运行时：Agent 怎么「记住」和「被打断」",
    description:
      "手写一轮 ReAct、接上 Skill 与 MCP，再换到 StateGraph + Checkpointer。Agent 的难点从来不是让模型说话，是第 N 轮还知道自己干到哪。",
    url: "https://jaderai.cn/blog/from-handwritten-react-to-langgraph-runtime",
    likes: 0,
    views: 0,
    date: "2026-08-31",
  },
  {
    title: "Agent 报错后别再发一遍消息：用 input=None 从检查点接着跑",
    description:
      "检查点已经替我保存了现场，我却亲手又铺了一层新现场。「重试」和「用户又发了一句」，是两种 API。",
    url: "https://jaderai.cn/blog/langgraph-retry-with-input-none",
    likes: 0,
    views: 0,
    date: "2026-08-25",
  },
  {
    title: "从空目录到第一颗星球",
    description: "一个 3D 作品站最早的一周，我在想什么、先做什么，又刻意没做什么。",
    url: "https://jaderai.cn/blog/astra-build-log",
    likes: 0,
    views: 0,
    date: "2026-08-04",
  },
  {
    title: "给一个 3D 作品站立规矩",
    description:
      "动手写业务代码之前，先把视觉、产品、代码三层的决定写死。附一个真实踩到的坑：MDX 不是 Markdown。",
    url: "https://jaderai.cn/blog/designing-astras-visual-language",
    likes: 0,
    views: 0,
    date: "2026-08-04",
  },
  {
    title: "一个能跑的电商后台，和会流式说话的 AI 导购",
    description:
      "从 UV workspace 到 OSS 直传、JWT、SSE / WS，做完一个带测试和前端 Demo 的电商后台 + AI 导购闭环。真正值钱的是配置、逻辑、测试各切一刀。",
    url: "https://jaderai.cn/blog/fastapi-ecommerce-with-streaming-ai-guide",
    likes: 0,
    views: 0,
    date: "2026-08-03",
  },
  {
    title: "SSE 明明在推流，前端却收到一坨 JSON",
    description:
      "全局统一响应中间件默认假设「响应是完整 JSON」，把事件流整个消费掉再包一层信封。引入 SSE / WS，必须留显式逃生舱。",
    url: "https://jaderai.cn/blog/unified-response-middleware-breaks-sse",
    likes: 0,
    views: 0,
    date: "2026-07-30",
  },
  {
    title: "make test 卡死半小时：元凶是系统代理，不是 Postgres",
    description:
      "httpx 默认 trust_env=True，把 localhost 请求也送进了 Clash。测本地服务时，健康检查与测试客户端都该显式 trust_env=False。",
    url: "https://jaderai.cn/blog/httpx-proxy-blocks-local-tests",
    likes: 0,
    views: 0,
    date: "2026-07-28",
  },
  {
    title: "先把地基打牢：uv、Docker 和第一个 PostgreSQL 容器",
    description:
      "七月中旬没碰模型，全在跟环境较劲。这一周最值的产出不是某个 Demo，是把「版本、依赖、解释器、数据都跟着项目走」这条姿势定下来。",
    url: "https://jaderai.cn/blog/python-tooling-and-first-postgres-container",
    likes: 0,
    views: 0,
    date: "2026-07-22",
  },
];
