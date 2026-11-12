import{j as n}from"./r3f-BjRlvwza.js";const o={title:"从空目录到第一颗星球",date:"2026-08-04",tags:["起步","作品集","3D 星图"],excerpt:"一个 3D 作品站最早的一周，我在想什么、先做什么，又刻意没做什么。"};function r(s){const e={blockquote:"blockquote",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...s.components};return n.jsxs(n.Fragment,{children:[n.jsxs(e.blockquote,{children:[`
`,n.jsx(e.p,{children:"2026 年 8 月 4 日。项目还是个空目录，我给自己的第一个要求不是「写得漂亮」，而是「三秒内让人记住」。一个能转、能点、能飞过去的 3D 星图，比十页自我介绍管用；剩下的细节，交给内容页慢慢承接。"}),`
`]}),`
`,n.jsx(e.p,{children:"所以第一周我几乎没碰内容，全在搭骨架：星系场景、相机飞行、玻璃面板、一条能进能出的路由。先把「点星球 → 飞过去 → 看内容 → 返回」这条主链路跑通，再谈别的。"}),`
`,n.jsx(e.h2,{children:"几个当时就定下来的取舍"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"状态机自己写。"})," 飞行动画拢共五个状态，用 Zustand 加个枚举就够了，没必要为这点复杂度引入 XState。"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"镜头用 GSAP 缓动 1.8 秒。"})," 再快会晕，再慢会拖；timeline 的 ",n.jsx(e.code,{children:"onComplete"})," 负责切状态，动画和逻辑分开。"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"星球程序化生成。"})," ",n.jsx(e.code,{children:"IcosahedronGeometry"})," 加自定义材质，不依赖任何外部模型文件，仓库干净、加载也快。"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Demo 走注册表 + 懒加载。"})," 一开始就把 AI 生成类、Shader 类的位置留好，后面接的时候不用改架构。"]}),`
`]}),`
`,n.jsx(e.p,{children:"这些决定后来基本都没推翻，算是那周最值钱的产出。"}),`
`,n.jsx(e.h2,{children:"数据从哪来"}),`
`,n.jsxs(e.p,{children:["作品站不能只有效果。我把手上最硬的一组数字先记下来，准备做成第一个能点开的对比 Demo：配电树构建 ",n.jsx(e.code,{children:"SET_LOW_TREE_DATA"})," 72s → 2.1s（34×），页面跳转 14s → 1.2s（12×），低端工控机的 OOM 消失。它们来自我在施耐德做 POI ConfigTools 性能治理的实际工作，不是编出来撑场面的。"]}),`
`,n.jsx(e.h2,{children:"当时列的下一步"}),`
`,n.jsx(e.p,{children:"博客全文、Sandpack 让用户能 fork 改代码、i18n 与性能收口。回过头看，有些已经落地，有些还欠着——这大概就是做个人项目最真实的状态：计划永远比进度长一点，但每一步都算数。"})]})}function c(s={}){const{wrapper:e}=s.components||{};return e?n.jsx(e,{...s,children:n.jsx(r,{...s})}):r(s)}export{c as default,o as frontmatter};
