import{j as e}from"./r3f-BjRlvwza.js";const d={title:"当鼠标一动，整片星空都在抖",date:"2026-11-09",tags:["交互设计","React Three Fiber","复盘"],excerpt:"一天之内连着改了两轮交互：上午修「一眼看过去不对劲」，下午修「改完反而更不对劲」。四个玄学 bug 最后都指向同一件事——交互状态放错了层。"};function s(c){const n={blockquote:"blockquote",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...c.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["2026 年 11 月 9 日，我把 ASTRA 的全景星系交互连着改了两轮。上午解决的是「一眼看过去不对劲」，下午解决的是「改完反而更不对劲」。这篇记的是后面那四个 bug，以及它们让我重新想清楚的一件事：",e.jsx(n.strong,{children:"交互状态到底该管到哪一层。"})]}),`
`]}),`
`,e.jsx(n.p,{children:"ASTRA 是我给自己做的作品站，主视觉是一片可以用鼠标转动、点击星球飞过去的 3D 星系。V1 上线之后我自己用着总觉得别扭，但说不清哪里别扭。真正坐下来一条条试，问题其实都很朴素。"}),`
`,e.jsx(n.h2,{children:"上午：四个「本来就别扭」的地方"}),`
`,e.jsxs(n.p,{children:["第一个是",e.jsx(n.strong,{children:"太远了"}),"。相机初始放在 ",e.jsx(n.code,{children:"[0, 8, 22]"}),"、fov 60，星球半径又刻意只给到 0.21~0.30，结果 1920 的屏幕上五颗星球加起来占不到 1.5% 的视野，第一眼根本看不出「这里能点」。这不是渲染问题，是我为了留白，把可用信息一起留没了。"]}),`
`,e.jsxs(n.p,{children:["第二个更尴尬：",e.jsx(n.strong,{children:"手机上完全用不了"}),"。导航全靠 hover，触屏没有 hover；",e.jsx(n.code,{children:"body { touch-action: none }"})," 本来是想让 3D 拖拽顺一点，顺手把内容面板的滚动也一起禁了；相机参数没有按竖屏 aspect 重算；最讽刺的是 ",e.jsx(n.code,{children:"detectMobile()"})," 我早就写好了，却一次都没调用过。一个已经实现了的能力，因为没接线，等于不存在。"]}),`
`,e.jsxs(n.p,{children:["第三个是",e.jsx(n.strong,{children:"切星球要绕远路"}),"。在内容页点另一颗星球，飞行动画会先「倒退 30 单位」回到全景，再重新俯冲过去，两段各 1.8 秒，共 3.6 秒。可状态机里明明已经有从 VIEWING 直接 FLYING_IN 的通路，我只是没让它走。"]}),`
`,e.jsxs(n.p,{children:["第四个是",e.jsx(n.strong,{children:"正文挤成一条"}),"。面板 ",e.jsx(n.code,{children:"min(960px, 100%)"}),"，正文又套了一层 ",e.jsx(n.code,{children:"max-width: 760px"}),"，两层收窄叠起来，大屏上阅读区只剩四成。"]}),`
`,e.jsxs(n.p,{children:["上午这轮我做的都是「把参数调回人话」：相机拉近到 ",e.jsx(n.code,{children:"[0, 4.5, 13]"}),"、fov 55；IDLE 下给星球常驻一枚紧凑标签（编号 + 中文名 + 拉丁名），hover 才展开描述，顺手补一条只出现一次的引导；切星球改成直跳，弧线抬起来避开星系核心，1.8s 收到 1.3s；面板放到 ",e.jsx(n.code,{children:"min(1240px, 92vw)"}),"、取消二次收窄；移动端补了六项，包括常驻标签加不可见命中球（保证 ≥44px）、放开 ",e.jsx(n.code,{children:"pan-y"}),"、竖屏重算相机、低画质关 Bloom、HUD 收成底部四个 tab。"]}),`
`,e.jsx(n.p,{children:"改完自测挺满意。然后下午问题来了。"}),`
`,e.jsx(n.h2,{children:"下午：鼠标一动，整片星空跟着抖"}),`
`,e.jsxs(n.p,{children:["最吓人的一个：鼠标划进场景，整个星空会平移一下。我用只读的运行时探针量了一下，四个 3D 标签集体右移 83~126px、下移 19~68px，而静置时的公转漂移只有个位数——差了一个数量级，所以肯定不是星球在转，是",e.jsx(n.strong,{children:"相机在转头"}),"。"]}),`
`,e.jsxs(n.p,{children:["根因在 ",e.jsx(n.code,{children:"CameraRig"})," 的 IDLE 分支里，一行很不起眼的代码："]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`tmpLook.set(state.pointer.x * 6, state.pointer.y * 4, 0);
`})}),`
`,e.jsxs(n.p,{children:["归一化指针被直接放大成 ±6 / ±4 世界单位的注视点偏移。上午我把相机从 22 拉到 13，视场收窄之后，同样一个偏移量在画面上被放大成了明显的一大跳：指针从初始态进入场景的瞬间，注视点从 ",e.jsx(n.code,{children:"(0,0,0)"})," 突变到 ",e.jsx(n.code,{children:"(1.15, 0.84, 0)"})," 量级，投影自然整体位移。",e.jsx(n.strong,{children:"参数没错，是「鼠标位置」这种 UI 状态根本不该出现在相机链路里。"})]}),`
`,e.jsxs(n.p,{children:["抖动还叠了第二层：chip 的展开同时由 CSS ",e.jsx(n.code,{children:":hover"}),"（改尺寸）和 React 的 ",e.jsx(n.code,{children:"onPointerOver"})," 驱动，而鼠标落在 drei ",e.jsx(n.code,{children:"<Html>"})," 生成的 DOM 上时 raycast 打不中命中球，React 那一路根本不触发。两条轨不同步，命中区随尺寸变化，hover 反复进出，展开/收起就开始抖。"]}),`
`,e.jsx(n.p,{children:"顺着这条线，另外三个问题也都不神秘了。"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"「星系怎么不动了」其实不是 bug。"})," 粒子没停帧，",e.jsx(n.code,{children:"uTime"})," 每帧都在推，是上午那套「拉近 + 收敛漂移」把可感知的运动一起收掉了：视场变窄、相机自身位移降到 ±0.8、盘面倾角恒值、自转速度 0.14（窄视场下 40 秒一圈，肉眼读不出来）。观感上就是「静止」。它和相机抖动同源——我把动感错误地寄托在了相机上。"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"返航时的「断崖」是状态不连续。"})," ",e.jsx(n.code,{children:"FLYING_OUT"})," 的终点是「沿观察方向倒退 30 单位」，而不是 ",e.jsx(n.code,{children:"homePos"}),"，紧接着 IDLE 的复位 effect 又硬切 ",e.jsx(n.code,{children:"camera.position.copy(homePos)"})," 并 ",e.jsx(n.code,{children:"lookAt(0,0,0)"}),"。观察位 → 拉到 30 单位外 → 瞬移回家，两段硬拼，怎么看都是断的。内容页的 ",e.jsx(n.code,{children:"onReturn"})," 还和路由同步各导航了一次。"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"作品卡片点不进去"}),"，则是四个里唯一称得上设计缺陷的：",e.jsx(n.code,{children:"<article>"})," 没有 ",e.jsx(n.code,{children:"onClick"}),"、没有 ",e.jsx(n.code,{children:"<Link>"}),"、没有 ",e.jsx(n.code,{children:"tabIndex"})," 和 ",e.jsx(n.code,{children:"role"}),"，CSS 却给了完整的 hover 抬升、阴影和描边，文案还写着「每个都能点进去看细节」。视觉和文案都在承诺，行为是死的——典型的虚假可供性。而且补这条路由有连带风险：",e.jsx(n.code,{children:"FlightRouterSync"})," 用全等判断路由，",e.jsx(n.code,{children:"/projects/p1"})," 不等于 ",e.jsx(n.code,{children:"/projects"}),"，新详情页会被立刻弹回列表。"]}),`
`,e.jsx(n.h2,{children:"我最后定下的几条规矩"}),`
`,e.jsx(n.p,{children:"这轮之后我给自己写了几条，比任何具体参数都管用："}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"hover 只驱动视觉，不驱动相机。"})," 相机一律由确定性的时间函数驱动，这样「动一下鼠标整片星空抖」这类问题从结构上就不可能发生。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"动画的终点必须等于下一状态的起点。"})," 不再允许「硬复位 + 硬切」两段拼接，IDLE 不覆写当前帧的位置和朝向。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"动感还给背景层。"})," 星系自转、盘面公转、倾角呼吸去做运动，相机只负责稳。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"别让界面撒谎。"})," 视觉、文案、行为三者一致；没做完的地方就明写「整理中」，不造一个假的正文页骗点击。"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"可度量才算验收。"})," 每个问题要么有探针数据，要么有能复现的手工口径，不靠「看着还行」。"]}),`
`]}),`
`,e.jsxs(n.p,{children:["落地时有个小习惯也救了我一次：想改 ",e.jsx(n.code,{children:"FLIGHT_DURATION_MS"})," 之前，先去测试里 grep 了一遍，发现 ",e.jsx(n.code,{children:"flightMachine.test.ts"})," 把这个 1800 断言死了。于是返航提速改成另开一个 ",e.jsx(n.code,{children:"FLIGHT_RETURN_MS = 1400"}),"，测试全绿。改常量前先看断言，这事看着琐碎，但能避免「改一个数、一整片红、还不知道为什么」。"]}),`
`,e.jsx(n.h2,{children:"结果，以及还没做完的"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"build"}),"、",e.jsx(n.code,{children:"typecheck"})," 通过，5 个测试文件 23 条用例全绿；探针确认 hover 前后相机位移同量级，背景层 4.5 秒连续移动 174px；390×844 真机竖屏没有溢出。"]}),`
`,e.jsx(n.p,{children:"也有没解决的：R3F 那个 chunk 打到 1,024 kB，构建一直在警告，首屏预算迟早要正面处理它；作品详情页目前还是明确标了「整理中」的占位；返航连续性我是靠标签投影 + 截图帧差 + 代码里的数学关系做代理验证的，没往生产代码里挂探针。"}),`
`,e.jsxs(n.p,{children:["写下来最大的收获其实一句话：",e.jsx(n.strong,{children:"很多「玄学 bug」不是玄学，是某个状态被放到了不该待的层里。"})," 上午我调了一堆参数，下午才明白，真正该改的是责任边界。"]})]})}function i(c={}){const{wrapper:n}=c.components||{};return n?e.jsx(n,{...c,children:e.jsx(s,{...c})}):s(c)}export{i as default,d as frontmatter};
