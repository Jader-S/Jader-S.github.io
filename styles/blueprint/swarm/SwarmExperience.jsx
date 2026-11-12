"use client";

import React from "react";
import { useSwarm } from "./hooks/useSwarm.js";
import { usePageInteractions } from "./hooks/usePageInteractions.js";
import { ContentCanvas, IntroLogo, StickyNavigation } from "./components/Stage.jsx";
import { CursorLayer } from "./components/Cursor.jsx";
import { ConstructionOverlay } from "./components/ConstructionOverlay.jsx";
import { Rulers } from "./components/Rulers.jsx";
import { InteractionDialog } from "./components/InteractionDialog.jsx";
import { createScene } from "./scene/create-scene.js";
import { PAGE_INTERACTIONS } from "./interactions/actions.js";

/**
 * 在独立全屏路由中展示协同施工页面，全部样式限制在swarm-experience命名空间内。
 * sceneFactory和autoStart在挂载时读取；修改这两项或重新播放时通过React的key重新挂载。
 * @param {object} props 可迁移组件配置。
 * @param {Function} [props.sceneFactory] 接收getWorkerCount并返回els、tasks、groups、height的场景工厂。
 * @param {object[]} [props.interactions] 由场景实体ID与任务ID组成的点击区域定义。
 * @param {(action:object,engine:object)=>boolean|void} [props.onAction] 外部同步处理器，返回true时拦截内置动作。
 * @param {boolean} [props.autoStart=false] 是否在字体准备完成后直接开始施工。
 * @param {(engine:object|null)=>void} [props.onEngine] 引擎就绪或卸载时的回调。
 * @param {string} [props.navLabel] 吸顶导航的无障碍名称。
 * @returns {React.ReactElement} 单实例、使用window滚动的完整场景。
 */
export function SwarmExperience({
  sceneFactory = createScene,
  interactions = PAGE_INTERACTIONS,
  onAction: onExternalAction,
  autoStart = false,
  onEngine,
  navLabel = "Main navigation",
}) {
  // 浏览器事件、字体和动画只在effect中初始化，服务端渲染阶段保留空容器。
  const engine = useSwarm({ sceneFactory, autoStart, onEngine });
  const { dialog, onAction, closeDialog } = usePageInteractions(
    engine,
    onExternalAction
  );
  return (
    <div className="swarm-experience">
      {engine && (
        <>
          <main className="page" style={{ height: engine.height * engine.vp.s }}>
            <StickyNavigation
              engine={engine}
              interactions={interactions}
              onAction={onAction}
              label={navLabel}
            />
            <ContentCanvas
              engine={engine}
              interactions={interactions}
              onAction={onAction}
            />
            <IntroLogo started={engine.started} onAction={onAction} />
            <ConstructionOverlay engine={engine} />
            <CursorLayer engine={engine} />
          </main>
          <Rulers engine={engine} />
          <InteractionDialog dialog={dialog} onClose={closeDialog} />
        </>
      )}
    </div>
  );
}
