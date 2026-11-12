import{j as n}from"./r3f-BjRlvwza.js";const c={title:"Agent 报错后别再发一遍消息：用 input=None 从检查点接着跑",date:"2026-08-25",tags:["LangGraph","检查点","运行时"],excerpt:"检查点已经替我保存了现场，我却亲手又铺了一层新现场。「重试」和「用户又发了一句」，是两种 API。"};function r(s){const e={blockquote:"blockquote",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",...s.components};return n.jsxs(n.Fragment,{children:[n.jsxs(e.blockquote,{children:[`
`,n.jsx(e.p,{children:"2026 年 8 月 25 日，LangGraph 的一次 Run 在工具节点抛错停住了。我想「接着跑」，于是对同一个 thread 又发了一遍用户消息——结果对话重复、账单多打一轮，而且根本没从错误前恢复。Retry 和「用户又说了句话」，原来是两种 API。"}),`
`]}),`
`,n.jsx(e.h2,{children:"现象"}),`
`,n.jsxs(e.p,{children:["某次 Run 在工具调用 / 模型节点抛错，图停住。想接着跑，就对同一 thread 再次 ",n.jsx(e.code,{children:"runs.wait(..., input={用户消息})"}),"，甚至把原话原样再发一次。"]}),`
`,n.jsxs(e.p,{children:["结果状态里",n.jsx(e.strong,{children:"又追加"}),"了一轮用户输入，对话变重复，模型白跑一轮，也不是从错误前的检查点恢复。"]}),`
`,n.jsxs(e.p,{children:["我真正想要的是：",n.jsx(e.strong,{children:"从错误发生前的最新检查点继续"}),"，不是新开一轮对话。"]}),`
`,n.jsx(e.h2,{children:"问题代码"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`# 错误：再塞一遍 input，等于追加新状态，不是重试
await client.runs.wait(
    thread_id,
    assistant_id,
    input={"messages": [{"role": "user", "content": "刚才那句再来一次"}]},
)
`})}),`
`,n.jsx(e.p,{children:"本地图同理："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`# 错误
await graph.ainvoke({"messages": [...]}, config=config)
`})}),`
`,n.jsx(e.h2,{children:"根因"}),`
`,n.jsxs(e.p,{children:["出错时 LangGraph 的行为是：图立即停止，而",n.jsx(e.strong,{children:"最新检查点 = 错误发生之前"}),"的那个检查点。"]}),`
`,n.jsxs(e.p,{children:["所以「重试」的语义是：对同一 thread，带着检查点上下文再跑，",n.jsx(e.strong,{children:"不要追加新的 input"}),"。再传 ",n.jsx(e.code,{children:"input"})," 会被当成一次新的状态更新，例如又 append 一条 HumanMessage。"]}),`
`,n.jsx(e.p,{children:"换句话说，检查点机制已经替我保存了现场，我却亲手又铺了一层新现场上去。"}),`
`,n.jsx(e.h2,{children:"正确写法"}),`
`,n.jsx(e.p,{children:"Agent Server / SDK："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`# 同一 thread，input=None = 从错误前检查点继续
await client.runs.wait(
    thread_id,
    assistant_id,
    input=None,
)
`})}),`
`,n.jsx(e.p,{children:"时间旅行 / Replay（指定检查点）同理："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`await client.runs.wait(
    thread_id,
    assistant_id,
    input=None,
    checkpoint=after_start,  # 或 fork 后的 checkpoint
)
`})}),`
`,n.jsx(e.p,{children:"本地编译图："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`await graph.ainvoke(input=None, config=config, context=context)
`})}),`
`,n.jsx(e.p,{children:"对照一下，四种意图别混："}),`
`,n.jsxs("table",{children:[n.jsx("thead",{children:n.jsxs("tr",{children:[n.jsx("th",{children:"意图"}),n.jsx("th",{children:"做法"})]})}),n.jsxs("tbody",{children:[n.jsxs("tr",{children:[n.jsx("td",{children:"用户说了句新话"}),n.jsxs("td",{children:["传新的 ",n.jsx("code",{children:"input"})]})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"上轮出错，原样重试"}),n.jsxs("td",{children:["同 thread，",n.jsx("code",{children:"input=None"})]})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"从历史某检查点重放"}),n.jsxs("td",{children:[n.jsx("code",{children:"input=None"})," + ",n.jsx("code",{children:"checkpoint=..."})]})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"改状态后再跑"}),n.jsxs("td",{children:["更新 values / fork，再 ",n.jsx("code",{children:"input=None"})]})]})]})]}),`
`,n.jsxs(e.p,{children:["同一系列还有三个相关提醒，够格做后续短文但不必单独成篇：子图 ",n.jsx(e.code,{children:"compile(checkpointer=False)"})," 时 interrupt 不生效；中断恢复会",n.jsx(e.strong,{children:"整节点重跑"}),"，副作用必须幂等；",n.jsx(e.code,{children:"Command(goto=...)"})," 与静态边并不互斥，可能两条路径都走。"]}),`
`,n.jsx(e.h2,{children:"可复用结论"}),`
`,n.jsxs(e.p,{children:["在有检查点的 Agent 里，",n.jsx(e.strong,{children:"「重试」和「用户又发了一句」是两种 API"}),"。习惯性把用户消息再 post 一次，往往只会制造重复状态。"]}),`
`,n.jsxs(e.p,{children:["看到报错先停一秒问自己：我是要新输入，还是要 ",n.jsx(e.code,{children:"input=None"}),"？这一秒能省掉一轮无谓的推理和一次莫名其妙的重复对话。"]})]})}function i(s={}){const{wrapper:e}=s.components||{};return e?n.jsx(e,{...s,children:n.jsx(r,{...s})}):r(s)}export{i as default,c as frontmatter};
