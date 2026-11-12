import{j as n}from"./r3f-BjRlvwza.js";const s={title:"一个 Cursor 窗口、三套 .venv：我是怎么把 Python 环境串烂的",date:"2026-10-21",tags:["Python 工具链","环境配置","调试"],excerpt:"三类看起来毫不相干的报错，同一个根因：作用域错了。项目目录、解释器、虚拟环境、笔记本内核，四者必须指向同一套。"};function r(c){const e={blockquote:"blockquote",code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",...c.components};return n.jsxs(n.Fragment,{children:[n.jsxs(e.blockquote,{children:[`
`,n.jsxs(e.p,{children:["2026 年 10 月 21 日，一个 Cursor 窗口里同时躺着 ",n.jsx(e.code,{children:"langchain-deepagent"}),"、",n.jsx(e.code,{children:"langgraph-python"}),"、",n.jsx(e.code,{children:"python-for-agent"})," 三个工程。半天之内我接连撞上三类看起来毫不相干的报错，最后发现是同一个根因：",n.jsx(e.strong,{children:"作用域错了"}),"。"]}),`
`]}),`
`,n.jsx(e.h2,{children:"三类报错，一个根因"}),`
`,n.jsxs(e.p,{children:["先是 ",n.jsx(e.code,{children:"make course"})," 直接失败：项目要求 ",n.jsx(e.code,{children:"Python ==3.13.11"}),"，实际解析到了 ",n.jsx(e.code,{children:"3.13.14"}),"。接着终端开始警告，",n.jsx(e.code,{children:"VIRTUAL_ENV"})," 指向的是 ",n.jsx(e.code,{children:"langgraph-python\\.venv"}),"，和当前打开的 ",n.jsx(e.code,{children:"langchain-deepagent\\.venv"})," 对不上。最迷惑的是 Jupyter：包明明已经装进本项目 ",n.jsx(e.code,{children:".venv"}),"，却报 ",n.jsx(e.code,{children:"ModuleNotFoundError: No module named 'langchain_python'"}),"。"]}),`
`,n.jsxs(e.p,{children:["三个现象分别落在构建工具、终端环境变量、笔记本内核上，看起来毫无关系。但它们都在问同一件事：",n.jsx(e.strong,{children:"你现在到底在用哪一套 Python？"})]}),`
`,n.jsx(e.h2,{children:"问题出在两处「差一点」"}),`
`,n.jsxs(e.p,{children:["第一处是版本锁的粒度。",n.jsx(e.code,{children:"pyproject.toml"})," 把补丁版本钉死了："]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-toml",children:`# langchain-deepagent/pyproject.toml
requires-python = "==3.13.11"
`})}),`
`,n.jsxs(e.p,{children:["而 ",n.jsx(e.code,{children:".python-version"})," 只写了主次版本："]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-text",children:`3.13
`})}),`
`,n.jsxs(e.p,{children:["uv 会在本机找「匹配 3.13 的最新补丁」，于是落到 ",n.jsx(e.code,{children:"3.13.14"}),"，和 lock 与 ",n.jsx(e.code,{children:"requires-python"})," 冲突。锁到 ",n.jsx(e.code,{children:"x.y.z"}),"，就得让版本文件也写到 ",n.jsx(e.code,{children:"x.y.z"}),"，这两处必须字节级一致。"]}),`
`,n.jsxs(e.p,{children:["第二处是「一个窗口开大目录」。Cursor 打开的是父目录 ",n.jsx(e.code,{children:"DuYi"}),"，编辑器只记住一个解释器；终端里可能还激活着上一个项目的 ",n.jsx(e.code,{children:".venv"}),"；uv 默认用",n.jsx(e.strong,{children:"当前项目"}),"的 ",n.jsx(e.code,{children:".venv"}),"，会忽略那个不匹配的已激活环境；Jupyter 内核跟着「当前解释器」走，未必等于当前课的 ",n.jsx(e.code,{children:".venv"}),"。四个角色各记各的，串台是迟早的。"]}),`
`,n.jsxs(e.p,{children:["有个诱惑特别要挡住：别用 ",n.jsx(e.code,{children:"uv ... --active"})," 去「迁就」那个错误激活的环境。uv 会老老实实把 A 项目的依赖装进 B 项目的 venv，问题从「装不上」升级成「装错了还不知道」。"]}),`
`,n.jsx(e.h2,{children:"正确姿势"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-powershell",children:`# 1. 对齐补丁版本（与 requires-python 一致）
cd langchain-deepagent
uv python pin 3.13.11
# .python-version 应变为 3.13.11

# 2. 不要跨项目带着激活的 venv
deactivate   # 若提示符还挂着别的 (.venv)

# 3. 一律用项目本地环境执行
uv run python --version
uv run python -c "import langchain_python; print('ok')"

# 4. Jupyter：右上角内核选
#    langchain-deepagent\\.venv\\Scripts\\python.exe
`})}),`
`,n.jsxs(e.p,{children:["工作流上我给自己定了三条：做哪门课，就 File → Open Folder 打开那个子目录，别长期停在 monorepo 根；命令优先 ",n.jsx(e.code,{children:"uv run"})," / ",n.jsx(e.code,{children:"make"}),"，少依赖手动 activate；",n.jsx(e.code,{children:"requires-python"})," 写到补丁版本时，",n.jsx(e.code,{children:".python-version"})," 同样写到补丁版本。"]}),`
`,n.jsx(e.h2,{children:"可复用结论"}),`
`,n.jsxs(e.p,{children:["环境串台不是「Python 坏了」，是",n.jsx(e.strong,{children:"作用域错了"}),"：项目目录、解释器、虚拟环境、笔记本内核，四者必须指向同一套。"]}),`
`,n.jsx(e.p,{children:"多课并行时，「一课一窗口」比「一个大仓库全开着」省心得多。这个坑本身不高级，但每换一台机器、每多开一门课，都值得先花两分钟确认一遍。"})]})}function d(c={}){const{wrapper:e}=c.components||{};return e?n.jsx(e,{...c,children:n.jsx(r,{...c})}):r(c)}export{d as default,s as frontmatter};
