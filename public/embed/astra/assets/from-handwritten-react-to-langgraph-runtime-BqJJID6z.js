import{j as e}from"./r3f-BjRlvwza.js";const t={title:"从手写 ReAct 到图运行时：Agent 怎么「记住」和「被打断」",date:"2026-08-31",tags:["Agent","LangGraph","MCP"],excerpt:"手写一轮 ReAct、接上 Skill 与 MCP，再换到 StateGraph + Checkpointer。Agent 的难点从来不是让模型说话，是第 N 轮还知道自己干到哪。"};function s(r){const n={blockquote:"blockquote",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...r.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["2026 年 8 月 4 日到 31 日，我从「手写一轮 ReAct」走到「把 Agent 放进一个可部署的图运行时」。这一个月最大的认知变化是：Agent 的难点从来不是让模型说话，而是",e.jsx(n.strong,{children:"让它在第 N 轮还知道自己是谁、干到哪、能不能被打断"}),"。"]}),`
`]}),`
`,e.jsx(n.h2,{children:"先补齐前置知识，再手写循环"}),`
`,e.jsx(n.p,{children:"我先把 Transformer 相关的概念过了一遍：Token、Attention、Prefill / Decode、KV Cache。不是为了训模型，是为了后面 debug 时看得懂「为什么长上下文会慢」「为什么工具调用要占 token」。"}),`
`,e.jsx(n.p,{children:"然后手写 ReAct 循环：模型 ↔ 工具多轮，注册内置的读写、bash、搜索工具。手写一遍才明白「工具描述写得好不好」直接决定循环收不收敛。接上 Tavily 做结构化网页搜索，Agent 终于不用生啃 HTML。"}),`
`,e.jsx(n.p,{children:"接着是三个让能力「可扩展」的东西："}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Skill"}),"：",e.jsx(n.code,{children:"SKILL.md"})," + ",e.jsx(n.code,{children:"use_skill"}),"，按需加载业务流程提示词。Agent「会什么流程」不再全塞进 system prompt。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"MCP"}),"：自己写 Client / Server（含 FastMCP），用标准协议接外部工具，启动时注入工具列表。工具生态从「我内置几个」变成「谁都能接」。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"子代理编排"}),"：主 Agent 派活给子 Agent，缓解单上下文膨胀。"]}),`
`]}),`
`,e.jsx(n.p,{children:"我用 Prompt / Context / Harness / Loop / Graph 五个视角总结过一轮 Agent 工程化方法论。回头看，这五个词基本预告了后面 LangGraph 要解决的问题。"}),`
`,e.jsx(n.h2,{children:"换成图之后，状态终于有了「家」"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"langgraph-python"})," 用 StateGraph + ToolNode + Checkpointer 搭核心 Agent 图：模型与工具循环、线程级状态持久化。",e.jsx(n.code,{children:"langgraph dev"})," 起在 ",e.jsx(n.code,{children:":2024"}),"，改代码即时可见。"]}),`
`,e.jsx(n.p,{children:"真正让我觉得「换对了」的是几个能力："}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"interrupt + HITL"}),"：",e.jsx(n.code,{children:"demo_interrupt*"})," 和子图中断，人在回路审批与恢复。工具调用前能 approve / edit / reject / respond，Agent 不再是一条道跑到黑。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Send 动态扇出"}),"：",e.jsx(n.code,{children:"demo_dynamic_fanout_graph"})," 按 ",e.jsx(n.code,{children:"tool_calls"})," 做 map-reduce 并行，多个工具结果回来再汇总。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Thread / Run / Cron API"}),"：会话、运行、定时任务，出错可以取消、可以重试，多任务策略可控。"]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"runs.stream"})," 事件流"]}),"：多种 ",e.jsx(n.code,{children:"stream_mode"}),"，HITL 恢复时前端也能拿到流式体验。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Store 长期记忆"}),"：跨 Thread 的 KV，按 ",e.jsx(n.code,{children:"user_id"})," 隔离，写入记忆后注入 system 提示——注意是",e.jsx(n.strong,{children:"新 Thread 才生效"}),"，这点当时迷惑过我。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"A2A 协议"}),"：Agent Server 用 Agent Card 把自己暴露给异构 Agent 客户端。"]}),`
`]}),`
`,e.jsxs(n.p,{children:["工具向也补齐了：",e.jsx(n.code,{children:"call_sub_agent"}),"（同图不同 Context）、",e.jsx(n.code,{children:"ask_user_question"}),"（中断出题等人答）、",e.jsx(n.code,{children:"save_long_term_memory"}),"（覆盖写长期记忆）、",e.jsx(n.code,{children:"web_search"})," / ",e.jsx(n.code,{children:"fetch_url"}),"（搜索与抓正文）。"]}),`
`,e.jsxs(n.p,{children:["最后是 ",e.jsx(n.code,{children:"langgraph build"})," 打镜像，Docker + PG + Redis 一把起，容器网络内用服务名连库——第一次有了「生产味」的本地部署。"]}),`
`,e.jsx(n.h2,{children:"一个月下来的结论"}),`
`,e.jsx(n.p,{children:"用 LangGraph + Agent Server + Store / Checkpointer + HITL + Send，做完了一个「可中断、可记忆、可并行、可部署」的 Agent 运行时。"}),`
`,e.jsxs(n.p,{children:["但图也带来新一类 bug：状态字段的读写契约、检查点恢复的语义、中断恢复时节点会不会整段重跑。八月那次「报错后该不该再发一遍用户消息」我就栽在这儿，后来写成了一篇短文。",e.jsx(n.strong,{children:"能力越强，越需要把「状态怎么流动」当成一等公民来设计。"})]})]})}function d(r={}){const{wrapper:n}=r.components||{};return n?e.jsx(n,{...r,children:e.jsx(s,{...r})}):s(r)}export{d as default,t as frontmatter};
