import{j as e}from"./r3f-BjRlvwza.js";const r={title:"让 Agent 自己写代码：沙箱、OSS 和多智能体",date:"2026-10-28",tags:["DeepAgent","多智能体","Agent Server"],excerpt:"沙箱销毁了文件还在、deploy 工具直接返回公网 URL。跨过这一步，Agent 从「回答问题」变成「交付东西」。"};function c(d){const n={blockquote:"blockquote",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...d.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["2026 年 10 月 28 日，",e.jsx(n.code,{children:"langchain-deepagent"})," 这条线告一段落：我做出了一个能在沙箱里写代码、把产物部署成公网 URL 的 Coding Agent。这一步跨过去之后，Agent 从「回答问题」变成了「交付东西」。"]}),`
`]}),`
`,e.jsx(n.h2,{children:"统一外观，再谈分工"}),`
`,e.jsxs(n.p,{children:["先用 ",e.jsx(n.code,{children:"create_agent"})," + 中间件把所有 Agent 收敛成同一套外观：结构化输出、PII 处理、重试、摘要，都做成可插拔的中间件。统一外观这件事看着是整理代码，实际是后面 handoff、路由、鉴权能成立的前提——大家得长得一样才好互相移交。"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"main_agent"})," 负责通识自答，编码 / 检索任务异步派给 coding / web 子代理，避免同轮轮询把延迟叠上去。",e.jsx(n.code,{children:"web_agent"})," 配 Tavily 做搜索、抓取、核实公开信息。"]}),`
`,e.jsx(n.h2,{children:"让代码真的跑在沙箱里"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"coding_agent"})," 接了阿里云沙箱（E2B 兼容）+ OSS 挂载：workspace / skills / output 三个目录挂在 OSS 上，",e.jsx(n.strong,{children:"沙箱销毁了文件仍在"}),"。这是我这台机器上最踏实的一个设计——临时算力和持久产物彻底解耦，重试、回放、审计都不用重新生成。"]}),`
`,e.jsxs(n.p,{children:["再封一个 ",e.jsx(n.code,{children:"deploy"})," 工具：构建静态产物 → 拷到 output → 返回公网 URL → 销毁沙箱。Agent 交付的不再是一段代码文本，而是一个能点开的链接。"]}),`
`,e.jsxs(n.p,{children:["多智能体这块做了两组：",e.jsx(n.code,{children:"handoff"})," 用 ",e.jsx(n.code,{children:"transfer_to"})," + ",e.jsx(n.code,{children:"Command.PARENT"})," 在专家 Agent 之间移交控制权与消息；路由模式用「结构化路由 + Send + 汇总」做企业服务台，HR / IT / 行政并行答复再 synthesize。"]}),`
`,e.jsxs(n.p,{children:["Agent Server 侧补齐认证 / 授权 / 隔离：Bearer → 用户 identity，权限按 ",e.jsx(n.code,{children:"{resource}:{action}"})," 描述，Store namespace 加前缀隔离。多用户跑在同一个运行时上，数据不至于串。"]}),`
`,e.jsx(n.h2,{children:"一组专题 Demo，比主流程更教东西"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"agents/demo/"})," 下我攒了一批小图，每个只验证一件事："]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"hitl_agent_demo.py"}),"：",e.jsx(n.code,{children:"interrupt_on"})," 做工具调用前的人工 approve / edit / reject。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"permission_agent_demo.py"})," + ",e.jsx(n.code,{children:"router_backend_demo.py"}),"：文件系统 ACL 与按路径前缀分后端。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"store_demo.py"}),"：验证 Store namespace 与用户 identity 对齐。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"compress_demo1~5.py"}),"：上下文压缩，",e.jsx(n.code,{children:"fraction"})," 触发要配 ",e.jsx(n.code,{children:"max_input_tokens"})," 才生效。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"todo_demo.py"})," / ",e.jsx(n.code,{children:"rubric_demo.py"}),"：先计划再行动、按评分标准打回重写（有迭代上限）。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"interpreter_demo.py"}),"：QuickJS + PTC 在解释器内可编程调工具，注意它不走父级 ToolNode。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"multimodal_demo.py"}),"：文件工具产出图片时，按模型 profile 重排 ToolMessage。"]}),`
`]}),`
`,e.jsxs(n.p,{children:["另外三个中间件能力也落地了：Skill 启动只扫 ",e.jsx(n.code,{children:"SKILL.md"})," 元数据、用到再 ",e.jsx(n.code,{children:"read_file"}),"；MCP 用 ",e.jsx(n.code,{children:"MultiServerMCPClient.get_tools()"})," 注入；Memory 把记忆文件放在带后端的路径上持久化。"]}),`
`,e.jsxs(n.p,{children:["其中 handoff 和文件权限各踩了一个坑，都是「不报错、但行为悄悄不对」那一类，我单独写了两篇——",e.jsx(n.strong,{children:"这类 bug 比抛异常的贵得多，因为你会先怀疑框架，最后发现是自己少写了一个字母。"})]}),`
`,e.jsx(n.h2,{children:"周边，也是工程能力"}),`
`,e.jsxs(n.p,{children:["十月到十一月顺手把几个学习仓拉齐，",e.jsx(n.code,{children:"Git fork + upstream"})," 保持和官方同步；克隆路径极深的 ",e.jsx(n.code,{children:"langfuse"})," 时开了 ",e.jsx(n.code,{children:"core.longpaths"})," 才 checkout 成功。笔记也定成双层：日笔记 + ",e.jsx(n.code,{children:"笔记/整合/"}),"（环境 / 踩坑 / 面试 / 项目实践），可检索。"]}),`
`,e.jsx(n.h2,{children:"一条能力演进线"}),`
`,e.jsxs(n.p,{children:["从七月的 ",e.jsx(n.code,{children:"uv"})," 和第一个 PG 容器，到 FastAPI 电商闭环，到手写 ReAct、MCP，再到 LangGraph 运行时，最后到这个能部署静态站的 Coding Agent——四个阶段产物分别是可跑的 Web API、可扩展工具的 ReAct Agent、带长期记忆的 Agent Server 图、沙箱 Coding Agent。"]}),`
`,e.jsx(n.p,{children:"它们不是四份作业，是同一条线上四次「把临时能力变成可复用结构」。"})]})}function o(d={}){const{wrapper:n}=d.components||{};return n?e.jsx(n,{...d,children:e.jsx(c,{...d})}):c(d)}export{o as default,r as frontmatter};
