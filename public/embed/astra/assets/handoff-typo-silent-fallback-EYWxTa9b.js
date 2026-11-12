import{j as e}from"./r3f-BjRlvwza.js";const c={title:"Agent 移交成功了，下一轮怎么又跑回默认？",date:"2026-10-28",tags:["LangGraph","多智能体","调试"],excerpt:"acitve_agent 少一个字母，不报错、不抛栈，只是每轮静默回落到默认 Agent。写状态和读状态，是一对字节级契约。"};function t(s){const n={blockquote:"blockquote",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["2026 年 10 月 28 日，我在 ",e.jsx(n.code,{children:"langchain-deepagent"})," 里调 handoff，撞上一个特别会骗人的 bug：当轮日志明明白白写着「控制权已移交 coding_agent」，下一轮用户一开口，图又跑回默认的 ",e.jsx(n.code,{children:"web_agent"}),"。不报错、不抛栈、类型检查全过。"]}),`
`]}),`
`,e.jsx(n.h2,{children:"现象"}),`
`,e.jsxs(n.p,{children:["用 ",e.jsx(n.code,{children:"transfer_to"})," 把控制权交给 ",e.jsx(n.code,{children:"coding_agent"}),"，当前轮看起来完全成功，有 ToolMessage 说移交完成。但从 ",e.jsx(n.code,{children:"START"})," 再进图时，条件边每次都回落到 ",e.jsx(n.code,{children:"web_agent"}),"。状态里「以为」写过 ",e.jsx(n.code,{children:"active_agent"}),"，读的时候却像从没存在过。"]}),`
`,e.jsx(n.h2,{children:"问题代码"}),`
`,e.jsx(n.p,{children:"写入用的是正确字段名："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# src/langchain_python/tools/transfer_to.py（节选）

return Command(
    graph=Command.PARENT,
    goto=agent_name,
    update={
        "active_agent": agent_name,
        "messages": [*all_messages, tool_messsage],
    },
)
`})}),`
`,e.jsx(n.p,{children:"状态类型声明也对："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`class GraphState(AgentState):
    active_agent: NotRequired[str]
`})}),`
`,e.jsxs(n.p,{children:["但条件边读的是",e.jsx(n.strong,{children:"拼错的键"}),"："]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# src/langchain_python/agents/handoff.py（问题所在）

flow.add_conditional_edges(
    START,
    lambda state: state.get("acitve_agent", "web_agent"),  # ← 少了一个字母、还换了位
    ["web_agent", "coding_agent"],
)
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"acitve_agent"})," 永远拿不到值，于是每一轮从 ",e.jsx(n.code,{children:"START"})," 都走默认值。"]}),`
`,e.jsx(n.p,{children:"同文件里还埋着一个相关坑：消息裁剪时只取最后一条，会把本轮的工具调用过程丢掉。正确做法是整段带上再追加 ToolMessage："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# 错误：只留最后一条，丢掉本轮工具过程
# ai_message = runtime.state.get("messages", [])[-1]

# 正确
all_messages = runtime.state.get("messages", [])
`})}),`
`,e.jsx(n.h2,{children:"根因"}),`
`,e.jsxs(n.p,{children:["Handoff 靠",e.jsx(n.strong,{children:"父图状态字段"}),"记住「当前该跑哪个子 Agent」。写入键和读取键必须字节级一致，这是一对契约。"]}),`
`,e.jsxs(n.p,{children:["这类 bug 难查在三点：类型检查不会报错，",e.jsx(n.code,{children:"state.get"})," 对任意字符串 key 都合法；运行时也不抛异常，只是静默走默认分支；日志里还能看到「移交成功」的 ToolMessage，等于给了你一个错误的安慰。我一开始怀疑的是 ",e.jsx(n.code,{children:"Command.PARENT"})," 的语义、子图状态合并、甚至框架版本，绕了一大圈才回去数那几个字母。"]}),`
`,e.jsx(n.h2,{children:"正确写法"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`flow.add_conditional_edges(
    START,
    lambda state: state.get("active_agent", "web_agent"),  # 与 update 键一致
    ["web_agent", "coding_agent"],
)
`})}),`
`,e.jsx(n.p,{children:"我给自己留了张自检清单："}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Command.update"})," 的键 == 条件边 ",e.jsx(n.code,{children:"state.get"})," 的键 == ",e.jsx(n.code,{children:"GraphState"})," 字段名。"]}),`
`,e.jsxs(n.li,{children:["用一次真实",e.jsx(n.strong,{children:"多轮"}),"对话验证：移交后第二轮用户消息是否仍停在目标 Agent。单轮成功不算数。"]}),`
`,e.jsxs(n.li,{children:["打印 ",e.jsx(n.code,{children:"state.keys()"})," / ",e.jsx(n.code,{children:'state.get("active_agent")'}),"，确认不是 ",e.jsx(n.code,{children:"None"}),"。"]}),`
`]}),`
`,e.jsxs(n.p,{children:["顺带一提，整理这篇的时候仓库里 ",e.jsx(n.code,{children:"handoff.py"})," 还留着 ",e.jsx(n.code,{children:"acitve_agent"})," 这个拼写，本地修掉再发版更稳。"]}),`
`,e.jsx(n.h2,{children:"可复用结论"}),`
`,e.jsxs(n.p,{children:["多智能体路由里，",e.jsx(n.strong,{children:"「写状态」和「读状态」是一对契约"}),"。拼写错误不会炸栈，只会表现为「怎么教都记不住该谁干」。"]}),`
`,e.jsx(n.p,{children:"遇到「移交成功但下次又重置」，先对键名做精确字符串比对，再怀疑框架。这个顺序能省下我那天下午的两小时。"})]})}function d(s={}){const{wrapper:n}=s.components||{};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{d as default,c as frontmatter};
