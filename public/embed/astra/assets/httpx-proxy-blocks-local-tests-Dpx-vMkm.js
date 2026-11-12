import{j as n}from"./r3f-BjRlvwza.js";const l={title:"make test 卡死半小时：元凶是系统代理，不是 Postgres",date:"2026-07-28",tags:["FastAPI","测试","httpx"],excerpt:"httpx 默认 trust_env=True，把 localhost 请求也送进了 Clash。测本地服务时，健康检查与测试客户端都该显式 trust_env=False。"};function t(s){const e={blockquote:"blockquote",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",...s.components};return n.jsxs(n.Fragment,{children:[n.jsxs(e.blockquote,{children:[`
`,n.jsxs(e.p,{children:["2026 年 7 月 28 日，",n.jsx(e.code,{children:"make test"})," 卡了将近半小时。我一口咬定是 Postgres 没起来，把容器日志翻了个遍、把连接池配置改了两轮，最后元凶是本机开着的 Clash 代理——跟数据库一点关系没有。"]}),`
`]}),`
`,n.jsx(e.h2,{children:"现象"}),`
`,n.jsx(e.p,{children:"e2e 测试启动后长时间没进展，进程停在「等本地测试服务器就绪」的轮询里。服务其实早就起来了，手动 curl 也通，就是测试里的健康检查永远等不到响应。"}),`
`,n.jsxs(e.p,{children:["本机开着代理（常见端口 ",n.jsx(e.code,{children:"7897"}),"），系统代理 / ",n.jsx(e.code,{children:"HTTP_PROXY"})," 已经注入环境。"]}),`
`,n.jsx(e.h2,{children:"问题代码"}),`
`,n.jsx(e.p,{children:"默认写法会读环境代理："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`import httpx

# 默认 trust_env=True → 走 HTTP_PROXY / HTTPS_PROXY / 系统代理
resp = httpx.get(f"http://localhost:{TEST_SERVER_PORT}/docs")
`})}),`
`,n.jsx(e.p,{children:"异步客户端同理："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`async with httpx.AsyncClient(base_url=f"http://localhost:{port}") as client:
    ...
`})}),`
`,n.jsx(e.h2,{children:"根因"}),`
`,n.jsxs(e.p,{children:["httpx（以及部分基于它的客户端）默认 ",n.jsx(e.code,{children:"trust_env=True"}),"。这个默认值访问公网时很贴心——公司代理统一走，不用每个请求配一遍；但",n.jsxs(e.strong,{children:["测本地 ",n.jsx(e.code,{children:"127.0.0.1"})," / ",n.jsx(e.code,{children:"localhost"})," 时是灾难"]}),"：请求被代理截走，健康检查失败，上层一直重试，表现出来就是「卡住」。"]}),`
`,n.jsx(e.p,{children:"最容易误判的地方在于，症状看起来像「服务器没起来」，于是排查方向全落在服务端。我那半小时基本花在了错误的一侧。"}),`
`,n.jsx(e.h2,{children:"正确写法"}),`
`,n.jsx(e.p,{children:"项目里已经改成显式关闭环境代理："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`# apps/web-service/test/conftest.py（节选）

# 等待测试服务器就绪
resp = httpx.get(
    f"http://localhost:{TEST_SERVER_PORT}/docs",
    trust_env=False,
)

# 异步测试客户端
async with AsyncClient(
    base_url=f"http://localhost:{TEST_SERVER_PORT}",
    trust_env=False,
) as client:
    yield client
`})}),`
`,n.jsx(e.p,{children:"如果确实需要保留代理访问外网，可以只对 localhost 关，或在测试进程里临时清掉："}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-powershell",children:`$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""
`})}),`
`,n.jsxs(e.p,{children:["但我更推荐把 ",n.jsx(e.code,{children:"trust_env=False"})," 写进代码——它不依赖每个人记得清环境变量，也不依赖「我这台机器没开代理」这种运气。"]}),`
`,n.jsx(e.h2,{children:"可复用结论"}),`
`,n.jsxs(e.p,{children:["测本地服务时：",n.jsxs(e.strong,{children:["健康检查与测试 HTTP 客户端都应 ",n.jsx(e.code,{children:"trust_env=False"})]}),"。"]}),`
`,n.jsx(e.p,{children:"在开发机开着系统代理的情况下，这是比「再等一会儿」「再查一遍数据库」更该先确认的一项。下次看到「本地请求莫名超时」，先问一句：这个请求真的发到 localhost 了吗？"})]})}function r(s={}){const{wrapper:e}=s.components||{};return e?n.jsx(e,{...s,children:n.jsx(t,{...s})}):t(s)}export{r as default,l as frontmatter};
