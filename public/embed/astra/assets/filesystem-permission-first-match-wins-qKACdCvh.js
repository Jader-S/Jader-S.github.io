import{j as e}from"./r3f-BjRlvwza.js";const o={title:"写了 deny，.env 还是能读：文件权限的顺序语义",date:"2026-10-28",tags:["DeepAgent","安全","ACL"],excerpt:"ACL 按列表顺序匹配、第一条命中即生效、全不中默认允许。宽泛的 allow 写在前面，deny 永远轮不到。"};function r(s){const n={blockquote:"blockquote",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["2026 年 10 月 28 日，给 DeepAgent 配 ",e.jsx(n.code,{children:"FilesystemPermission"})," 时我按直觉写了一条 deny，想挡住 ",e.jsx(n.code,{children:".env"}),"。结果 Agent 照样把密钥文件读了出来。不是权限没生效，是",e.jsx(n.strong,{children:"顺序写反了"}),"。"]}),`
`]}),`
`,e.jsx(n.h2,{children:"现象"}),`
`,e.jsxs(n.p,{children:["本意是禁止读敏感路径（",e.jsx(n.code,{children:".env"}),"、工作区里的密钥），配完 Agent 仍然能 ",e.jsx(n.code,{children:"read_file"})," 读到。另一种表现是：同时传入沙箱 ",e.jsx(n.code,{children:"backend"})," 和 ",e.jsx(n.code,{children:"permissions"})," 时直接 ",e.jsx(n.code,{children:"NotImplementedError"}),"。"]}),`
`,e.jsx(n.h2,{children:"问题代码（顺序写反的典型）"}),`
`,e.jsx(n.p,{children:"错误直觉是「先广泛允许工作区，再单独 deny 敏感文件」："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`permissions = [
    FilesystemPermission(
        operations=["read", "write"],
        paths=["/home/user/workspace/**"],
        mode="allow",          # 先命中 → 直接允许
    ),
    FilesystemPermission(
        operations=["read", "write"],
        paths=["**/.*", "**/.env", "/home/user/.env"],
        mode="deny",           # 永远轮不到
    ),
]
`})}),`
`,e.jsxs(n.p,{children:["规则语义是：",e.jsx(n.strong,{children:"按列表顺序匹配，第一条命中即生效；全不中则默认允许。"})]}),`
`,e.jsxs(n.p,{children:["所以宽泛的 ",e.jsx(n.code,{children:"allow"})," 放在前面，敏感路径也先被它吃掉，后面的 ",e.jsx(n.code,{children:"deny"})," 一次都轮不上。这和「deny 永远优先」或「最后一条为准」的直觉正好相反——我一开始就是按后两种理解的。"]}),`
`,e.jsx(n.h2,{children:"正确写法"}),`
`,e.jsxs(n.p,{children:["目标若是「默认拒绝、只放开工作区」，要保证命中工作区走 allow、命中 ",e.jsx(n.code,{children:".env"})," 时 allow 条匹配不到、由后面的 deny 吃掉；或者把更具体的 deny 放到会先匹配的位置。"]}),`
`,e.jsx(n.p,{children:"课件 demo 的顺序是先允许用户目录下的明确范围，再大范围 deny："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# src/langchain_python/agents/demo/permission_agent_demo.py

agent = create_deep_agent(
    model=model,
    system_prompt=system_prompt,
    permissions=[
        FilesystemPermission(
            operations=["read", "write"],
            paths=["/home/user", "/home/user/**", "/home/user/**/.*{,/**}"],
            mode="allow",
        ),
        FilesystemPermission(
            operations=["read", "write"],
            paths=["/**", "/**/.*{,/**}"],
            mode="deny",
        ),
    ],
)
`})}),`
`,e.jsx(n.p,{children:"还有一条版本相关的硬约束："}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# 会 NotImplementedError：沙箱 backend 与 permissions 不能一起交给 create_deep_agent
create_deep_agent(backend=sandbox_backend, permissions=[...])
`})}),`
`,e.jsxs(n.p,{children:["原因不是偷懒：",e.jsx(n.code,{children:"execute"})," 类工具能走 shell（",e.jsx(n.code,{children:"cat"})," / ",e.jsx(n.code,{children:"cp"})," / ",e.jsx(n.code,{children:"rm"}),"）绕过「文件工具」上的权限检查。需要命令执行时，隔离应该放在沙箱本身，并用 ",e.jsx(n.code,{children:"interrupt_on"})," 审批高风险工具，而不是假装配了文件路径 ACL 就安全。"]}),`
`,e.jsx(n.h2,{children:"根因"}),`
`,e.jsxs(n.p,{children:["这是典型的 ",e.jsx(n.strong,{children:"ACL 顺序语义"}),"，和防火墙「从上到下、命中即停」一模一样。安全配置里的「直觉顺序」往往最危险，因为它不报错、不告警，只是安静地放行。"]}),`
`,e.jsx(n.h2,{children:"可复用结论"}),`
`,e.jsx(n.p,{children:"写 DeepAgent 文件权限时，先问自己两句："}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.strong,{children:"目标路径会命中列表里的第几条？"})}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"execute"})," 是否还能绕过？"]})," 能绕过就别把文件路径 ACL 当成安全边界。"]}),`
`]}),`
`,e.jsxs(n.p,{children:["配完权限别只看「配置写上了」，拿一个真实的敏感路径跑一次 ",e.jsx(n.code,{children:"read_file"}),"，比读三遍文档都可靠。"]})]})}function c(s={}){const{wrapper:n}=s.components||{};return n?e.jsx(n,{...s,children:e.jsx(r,{...s})}):r(s)}export{c as default,o as frontmatter};
