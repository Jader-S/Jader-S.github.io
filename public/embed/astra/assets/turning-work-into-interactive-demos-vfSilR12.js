import{j as n}from"./r3f-BjRlvwza.js";const c={title:"把做过的事，变成能点开看的 Demo",date:"2026-11-11",tags:["作品集","数据可视化","内容设计"],excerpt:"星图搭好了，点进「作品」星球却发现卡片是空的。作品集要回答的不是「我会什么特效」，而是「我解决过什么问题」。"};function r(e){const s={blockquote:"blockquote",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...e.components};return n.jsxs(n.Fragment,{children:[n.jsxs(s.blockquote,{children:[`
`,n.jsxs(s.p,{children:["2026 年 11 月 11 日。3D 星图、飞行转场、HUD 都齐了，我点进「作品」星球，忽然有点尴尬：卡片是有的，描述是空的；Demo 是做了几个的，却有好几个没挂到任何项目底下。炫技的部分做完了，作品集真正该回答的问题还一个没答——",n.jsx(s.strong,{children:"我到底解决过什么问题。"})]}),`
`]}),`
`,n.jsx(s.p,{children:"那天我没写页面，先把这几年的工作摊开来盘点了一遍。"}),`
`,n.jsx(s.h2,{children:"先分产品，再挑亮点"}),`
`,n.jsx(s.p,{children:"我按四条线切开："}),`
`,n.jsxs(s.ul,{children:[`
`,n.jsxs(s.li,{children:[n.jsx(s.strong,{children:"POI ConfigTools"}),"（离线配置、生成工程下发）：配电树架构重构、数据保护 mixin、左侧树升级、性能治理与 OOM。"]}),`
`,n.jsxs(s.li,{children:[n.jsx(s.strong,{children:"POI 运行时"}),"（SPA 可视化监控）：单线图 SVG 电流、ECharts 放大镜、低端 Linux 工控机闪屏、中压单线图、有源滤波柜、直流微网。"]}),`
`,n.jsxs(s.li,{children:[n.jsx(s.strong,{children:"POAE 资产健康专家"}),"：30+ 内置模板组件从 Vue 迁到 React，抽象 ",n.jsx(s.code,{children:"RenderComponent"})," 与类型收敛，报警四件套联动，抽公共视频组件。"]}),`
`,n.jsxs(s.li,{children:[n.jsx(s.strong,{children:"AI 协作与工程化"}),"：Copilot 性能治理、规则沉淀、团队分享。"]}),`
`]}),`
`,n.jsxs(s.p,{children:["切完再从里面挑「能演出来」的。我的挑选标准只有一条：",n.jsx(s.strong,{children:"得讲得出「问题 → 思路 → 结果」，最好还能给出数字"}),"。按这个标准，最后留下六个："]}),`
`,n.jsxs("table",{children:[n.jsx("thead",{children:n.jsxs("tr",{children:[n.jsx("th",{children:"亮点"}),n.jsx("th",{children:"关键做法"}),n.jsx("th",{children:"结果"})]})}),n.jsxs("tbody",{children:[n.jsxs("tr",{children:[n.jsx("td",{children:"配电树架构重构"}),n.jsx("td",{children:"双存储收敛成单一树 + 节点索引 Map + UUID"}),n.jsx("td",{children:"72s → 2.1s（34×）"})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"页面跳转性能"}),n.jsx("td",{children:"关键链路打点、热点分层拆解、链路止血"}),n.jsx("td",{children:"14s → 1.2s（12×）"})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"OOM 治理"}),n.jsx("td",{children:"结构收敛 + 大对象生命周期整理"}),n.jsx("td",{children:"JS Heap 4197MB → 稳定"})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"单线图 SVG 电流"}),n.jsxs("td",{children:[n.jsx("code",{children:"stroke-dashoffset"})," + 状态同步"]}),n.jsx("td",{children:"业务状态精准同步"})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"ECharts 放大镜"}),n.jsx("td",{children:"canvas + dpr 适配 + 对数插值刻度"}),n.jsx("td",{children:"海量散点像素级可读"})]}),n.jsxs("tr",{children:[n.jsx("td",{children:"Copilot 性能治理"}),n.jsx("td",{children:"增量更新 + trace-point 埋点"}),n.jsx("td",{children:"bay 切换 14s → 1–2s（7–10×）"})]})]})]}),`
`,n.jsx(s.p,{children:"这些数字不是为了好看，是为了让人能亲手验证。作品集里写「优化了性能」没有意义，写「72 秒到 2.1 秒」并且放一个能点开看前后对比的东西，才有意义。"}),`
`,n.jsx(s.h2,{children:"一个 Demo 长什么样"}),`
`,n.jsxs(s.p,{children:["我给每个 Demo 定了统一的形态：",n.jsx(s.strong,{children:"一段不绕弯的三段叙事 + 一个可交互主体 + 一条量化指标"}),"。视觉上全部复用同一套舞台容器和配色变量，不另起风格——新加一个 Demo 只需要关心「演什么」，不用重新设计「长什么样」。"]}),`
`,n.jsx(s.p,{children:"举两个我比较满意的设计。"}),`
`,n.jsxs(s.p,{children:[n.jsx(s.strong,{children:"ECharts 放大镜。"})," 场景是运行时监控里上万点的散点图，缩到一屏之后细节全糊了。我做了个左右对照：左边是原始的「看不清」，右边鼠标悬停时出现一枚圆形放大镜，里面重绘局部数据。真正花功夫的是两个细节：canvas 要按 devicePixelRatio 重算才不糊；刻度不能线性映射，得用对数插值，否则放大区域里点还是挤成一坨。再加圆角标签和全屏组合，一个「像素级可读」的证明就成立了。"]}),`
`,n.jsxs(s.p,{children:[n.jsx(s.strong,{children:"Copilot 性能治理。"})," 这个我想做成一条埋点时间轴：左边一根 14 秒的长条，右边一根 1–2 秒的短条，中间是分步验证和埋点过程，能点开看每一步停在哪。它比单纯的性能对比多一层价值——我真正想展示的是",n.jsx(s.strong,{children:"怎么把一次个人排查变成团队可复用的方法"}),"：先分型，再用 PerformanceObserver 打点定位关键链路，把热点分层拆开，逐段止血，最后收敛结构并验证闭环。"]}),`
`,n.jsx(s.h2,{children:"内容侧的坑：做好的东西没被看见"}),`
`,n.jsx(s.p,{children:"盘点时最扎心的是发现两处「做了但等于没做」："}),`
`,n.jsxs(s.p,{children:["一个是",n.jsx(s.strong,{children:"孤儿 Demo"}),"：",n.jsx(s.code,{children:"FactoryLine"})," 这个 3D 工厂线组件早就写好、也注册进了 registry，但没有任何项目引用它，站点上根本找不到入口。另一个是",n.jsx(s.strong,{children:"空壳项目"}),"：p3 联夯那张卡只有标题，",n.jsx(s.code,{children:"desc"})," 是空的，点进详情页只显示「整理中」。"]}),`
`,n.jsx(s.p,{children:"这两件事都不是代码 bug，是内容没接线。我顺手把它们合并解决了——用工厂线当背景套一层生产运营看板，做成完整的大屏 Demo，挂进 p3，再把描述补齐（这段我单独写了一篇）。"}),`
`,n.jsxs(s.p,{children:["还有一条约束是测试给的：",n.jsx(s.code,{children:"i18n.test.ts"})," 会逐 key 比对中英文结构，新增任何文案都必须中英同步，连 ",n.jsx(s.code,{children:"postCount(n)"})," 这种函数签名都得一致。所以每加一个 Demo 的标题、叙事、按钮、指标，都得两边一起写。麻烦，但比线上出现一串 key 名强。"]}),`
`,n.jsx(s.h2,{children:"还欠着的"}),`
`,n.jsx(s.p,{children:"盘完六个亮点，做成可交互的只有三个：配电树、单线图电流、放大镜。剩下三个（数据保护流程、Linux 闪屏、Copilot 性能治理）还停在方案里，其中 Copilot 那个量化最硬，我打算下一个做它。"}),`
`,n.jsx(s.p,{children:"另外几件事我一直没定：施耐德那张卡现在把「配置工具」和「运行时可视化」混在一起讲，要不要拆成两张；POAE 要不要单独成卡（Vue→React 迁移其实是挺硬的证明）；以及如果有脱敏后的真实截图，是不是该换掉现在的纯前端模拟——模拟数据可以演示机制，但说服力终究差一档。"}),`
`,n.jsx(s.p,{children:"作品集不是简历的网页版。简历是「我说我做过」，作品集得是「你可以自己点开验证」。这层区别，是我这次盘点最大的收获。"})]})}function i(e={}){const{wrapper:s}=e.components||{};return s?n.jsx(s,{...e,children:n.jsx(r,{...e})}):r(e)}export{i as default,c as frontmatter};
