/**
 * build-blog-logs.mjs
 * 把 logs/*.md（Jader 的第一人称技术博文）转换成站点「日志」页能读取的 MDX。
 *
 * 站点数据链路：
 *   BlogPage -> services/content.ts -> import.meta.glob('../content/blog/*.mdx')
 *   -> toMeta() 读 frontmatter 的 title / date / tags / excerpt
 *   -> BlogPage 按 date 倒序 sort 后渲染；BlogPostPage 用 Panel 的 title/sub 展示标题与日期
 * 因此：文章必须落在 src/content/blog/*.mdx，4 个 frontmatter 字段齐全，
 * 正文不要再写 h1（标题已由页面渲染）。date 一律用字符串，避免 YAML 日期对象
 * 让 localeCompare 排序崩掉。
 *
 * 源文件命名：<大写前缀><两位编号>-<标题>.md，前缀仅作内部分组：
 *   L0x = ASTRA 作品站建设线
 *   P0x = AI 工程实践历程（来自「实践成果与 Demo 清单」）
 *   Q0x = 问题与解法（来自「博客选题：问题代码与解法」）
 * META 的 key 取文件名前 3 字符（如 P01 / Q06）。
 *
 * 本项目未装 remark-gfm：markdown 表格需转成原生 <table>；
 * MDX 会把正文裸的 <...> / {...} 当 JSX 编译，非代码段需转义为 HTML 实体。
 *
 * 用法：node scripts/build-blog-logs.mjs
 * 输入：logs/*.md（唯一源，人工撰写；_archive/ 子目录不参与）
 * 输出：src/content/blog/<slug>.mdx（派生的发布版，可随时重跑覆盖）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGS = path.join(ROOT, 'logs');
const OUT = path.join(ROOT, 'src', 'content', 'blog');

// 每篇博文的发布元数据。date = 真实工作日期（非整理日），列表按它倒序。
const META = {
  L01: {
    slug: 'astra-interaction-redesign',
    title: '当鼠标一动，整片星空都在抖',
    date: '2026-11-09',
    tags: ['交互设计', 'React Three Fiber', '复盘'],
    excerpt: '一天之内连着改了两轮交互：上午修「一眼看过去不对劲」，下午修「改完反而更不对劲」。四个玄学 bug 最后都指向同一件事——交互状态放错了层。',
  },
  L02: {
    slug: 'designing-astras-visual-language',
    title: '给一个 3D 作品站立规矩',
    date: '2026-08-04',
    tags: ['设计系统', '架构决策', '作品集'],
    excerpt: '动手写业务代码之前，先把视觉、产品、代码三层的决定写死。附一个真实踩到的坑：MDX 不是 Markdown。',
  },
  L03: {
    slug: 'turning-work-into-interactive-demos',
    title: '把做过的事，变成能点开看的 Demo',
    date: '2026-11-11',
    tags: ['作品集', '数据可视化', '内容设计'],
    excerpt: '星图搭好了，点进「作品」星球却发现卡片是空的。作品集要回答的不是「我会什么特效」，而是「我解决过什么问题」。',
  },
  L04: {
    slug: 'rebuilding-a-production-line-in-the-browser',
    title: '在浏览器里复原一条航天产线',
    date: '2026-11-12',
    tags: ['Three.js', 'ECharts', '数字孪生'],
    excerpt: '用 Three.js + ECharts 把七八年前做过的数字孪生重做一遍：主题变量桥接、资源清理、让模拟数据活起来，以及我特意没做的事。',
  },

  // —— AI 工程实践历程（8 个阶段两两合并）——
  P01: {
    slug: 'python-tooling-and-first-postgres-container',
    title: '先把地基打牢：uv、Docker 和第一个 PostgreSQL 容器',
    date: '2026-07-22',
    tags: ['Python 工程化', 'uv', 'Docker'],
    excerpt: '七月中旬没碰模型，全在跟环境较劲。这一周最值的产出不是某个 Demo，是把「版本、依赖、解释器、数据都跟着项目走」这条姿势定下来。',
  },
  P02: {
    slug: 'fastapi-ecommerce-with-streaming-ai-guide',
    title: '一个能跑的电商后台，和会流式说话的 AI 导购',
    date: '2026-08-03',
    tags: ['FastAPI', 'SQLAlchemy', '流式 API'],
    excerpt: '从 UV workspace 到 OSS 直传、JWT、SSE / WS，做完一个带测试和前端 Demo 的电商后台 + AI 导购闭环。真正值钱的是配置、逻辑、测试各切一刀。',
  },
  P03: {
    slug: 'from-handwritten-react-to-langgraph-runtime',
    title: '从手写 ReAct 到图运行时：Agent 怎么「记住」和「被打断」',
    date: '2026-08-31',
    tags: ['Agent', 'LangGraph', 'MCP'],
    excerpt: '手写一轮 ReAct、接上 Skill 与 MCP，再换到 StateGraph + Checkpointer。Agent 的难点从来不是让模型说话，是第 N 轮还知道自己干到哪。',
  },
  P04: {
    slug: 'coding-agent-sandbox-oss-and-multi-agent',
    title: '让 Agent 自己写代码：沙箱、OSS 和多智能体',
    date: '2026-10-28',
    tags: ['DeepAgent', '多智能体', 'Agent Server'],
    excerpt: '沙箱销毁了文件还在、deploy 工具直接返回公网 URL。跨过这一步，Agent 从「回答问题」变成「交付东西」。',
  },

  // —— 问题与解法（A–F 六篇选题）——
  Q01: {
    slug: 'python-venv-scope-mess',
    title: '一个 Cursor 窗口、三套 .venv：我是怎么把 Python 环境串烂的',
    date: '2026-10-21',
    tags: ['Python 工具链', '环境配置', '调试'],
    excerpt: '三类看起来毫不相干的报错，同一个根因：作用域错了。项目目录、解释器、虚拟环境、笔记本内核，四者必须指向同一套。',
  },
  Q02: {
    slug: 'httpx-proxy-blocks-local-tests',
    title: 'make test 卡死半小时：元凶是系统代理，不是 Postgres',
    date: '2026-07-28',
    tags: ['FastAPI', '测试', 'httpx'],
    excerpt: 'httpx 默认 trust_env=True，把 localhost 请求也送进了 Clash。测本地服务时，健康检查与测试客户端都该显式 trust_env=False。',
  },
  Q03: {
    slug: 'unified-response-middleware-breaks-sse',
    title: 'SSE 明明在推流，前端却收到一坨 JSON',
    date: '2026-07-30',
    tags: ['FastAPI', '流式 API', '中间件'],
    excerpt: '全局统一响应中间件默认假设「响应是完整 JSON」，把事件流整个消费掉再包一层信封。引入 SSE / WS，必须留显式逃生舱。',
  },
  Q04: {
    slug: 'handoff-typo-silent-fallback',
    title: 'Agent 移交成功了，下一轮怎么又跑回默认？',
    date: '2026-10-28',
    tags: ['LangGraph', '多智能体', '调试'],
    excerpt: 'acitve_agent 少一个字母，不报错、不抛栈，只是每轮静默回落到默认 Agent。写状态和读状态，是一对字节级契约。',
  },
  Q05: {
    slug: 'filesystem-permission-first-match-wins',
    title: '写了 deny，.env 还是能读：文件权限的顺序语义',
    date: '2026-10-28',
    tags: ['DeepAgent', '安全', 'ACL'],
    excerpt: 'ACL 按列表顺序匹配、第一条命中即生效、全不中默认允许。宽泛的 allow 写在前面，deny 永远轮不到。',
  },
  Q06: {
    slug: 'langgraph-retry-with-input-none',
    title: 'Agent 报错后别再发一遍消息：用 input=None 从检查点接着跑',
    date: '2026-08-25',
    tags: ['LangGraph', '检查点', '运行时'],
    excerpt: '检查点已经替我保存了现场，我却亲手又铺了一层新现场。「重试」和「用户又发了一句」，是两种 API。',
  },
};

/** 把 MDX 敏感字符转成 HTML 实体（保留 markdown 语法与反引号 code span） */
function escapeText(s) {
  return s.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;').replace(/</g, '&lt;');
}

/** 处理普通行：反引号 code span 原样，其余文本段转义 */
function inline(s) {
  return s
    .split(/(`[^`]*`)/g)
    .map((p) =>
      p.length >= 2 && p.startsWith('`') && p.endsWith('`') ? p : escapeText(p),
    )
    .join('');
}

// 表格里 `a \|\| b` 的转义竖线不能当列分隔符，先用占位符保护
const PIPE_ESC = '\u0001';

/** 表格单元格：转成 JSX 安全的 HTML 片段（code / strong 内联） */
function cell(s) {
  return s
    .split(/(`[^`]*`)/g)
    .map((p) => {
      if (p.length >= 2 && p.startsWith('`') && p.endsWith('`')) {
        const inner = p
          .slice(1, -1)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\{/g, '&#123;')
          .replace(/\}/g, '&#125;')
          .replaceAll(PIPE_ESC, '|'); // 还原 \| 为字面竖线
        return `<code>${inner}</code>`;
      }
      return escapeText(p)
        .replaceAll(PIPE_ESC, '|')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    })
    .join('');
}

function isTableSep(line) {
  return /^\|[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  s = s.replace(/\\\|/g, PIPE_ESC); // 转义竖线先占位，避免被当分隔符
  return s.split('|').map((c) => c.trim());
}

/** pipe 表格块 -> 原生 <table>（MDX 无 gfm，只能自己转） */
function renderTable(lines) {
  const head = splitRow(lines[0]);
  const body = lines.slice(2).map(splitRow);
  let out = '<table>\n<thead>\n<tr>';
  out += head.map((h) => `<th>${cell(h)}</th>`).join('') + '</tr>\n</thead>\n<tbody>\n';
  for (const row of body) {
    out += '<tr>' + row.map((c) => `<td>${cell(c)}</td>`).join('') + '</tr>\n';
  }
  out += '</tbody>\n</table>';
  return out;
}

/** 正文转换：围栏代码块原样、pipe 表格转 HTML、其余行转义 */
function convertBody(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inFence = false;
  let tables = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      out.push(line);
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const block = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        block.push(lines[i]);
        i++;
      }
      i--;
      out.push('', renderTable(block), '');
      tables++;
      continue;
    }
    out.push(inline(line));
  }
  return { body: out.join('\n'), tables };
}

function yamlStr(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function frontmatter(meta) {
  return [
    '---',
    `title: ${yamlStr(meta.title)}`,
    `date: ${yamlStr(meta.date)}`, // 必须字符串：YAML 裸日期会被解析成 Date，列表排序 localeCompare 会崩
    `tags: [${meta.tags.map(yamlStr).join(', ')}]`,
    `excerpt: ${yamlStr(meta.excerpt)}`,
    '---',
  ].join('\n');
}

function main() {
  const files = fs
    .readdirSync(LOGS)
    .filter((f) => /^[A-Z]\d{2}-.*\.md$/.test(f))
    .sort();
  fs.mkdirSync(OUT, { recursive: true });

  const report = [];
  for (const file of files) {
    const key = file.slice(0, 3);
    const meta = META[key];
    if (!meta) {
      report.push(`SKIP  ${file} (无 META)`);
      continue;
    }
    const md = fs.readFileSync(path.join(LOGS, file), 'utf8');
    const { body, tables } = convertBody(md);
    const mdx = `${frontmatter(meta)}\n\n${body.trimStart()}\n`;
    const dest = path.join(OUT, `${meta.slug}.mdx`);
    fs.writeFileSync(dest, mdx, 'utf8');
    report.push(`OK    ${file} -> ${meta.slug}.mdx  (${meta.date}, 表格 ${tables} 个, ${body.length} 字符)`);
  }
  console.log(report.join('\n'));
  console.log(`\n共生成 ${report.filter((r) => r.startsWith('OK')).length} 篇 -> ${OUT}`);
}

main();
