import { useCallback, useState } from "react";
import { NAV_HEIGHT, RULER_SIZE } from "../scene/theme.js";
import { ActionType } from "../interactions/actions.js";

/**
 * 统一处理导航、开场施工与弹窗，交互状态独立于高频更新的动画实体。
 * @param {object|null} engine 字体准备完成后的场景引擎。
 * @param {(action:object,engine:object)=>boolean|void} [onExternalAction] 同步返回true时接管该动作。
 * @returns {{dialog:object|null,onAction:Function,closeDialog:Function}} 展示层所需的状态与操作。
 */
export function usePageInteractions(engine, onExternalAction) {
  const [dialog, setDialog] = useState(null);

  /**
   * 按动作类型启动施工、滚动至现有区块或展示本地交互弹窗。
   * @param {object} action 来自页面交互配置的动作。
   * @returns {void}
   */
  const onAction = useCallback(
    (action) => {
      // 字体初始化阶段没有引擎，忽略尚不可用的操作。
      if (!engine) return;
      // 宿主可接入自己的路由、弹窗或业务按钮；只有明确返回true才停止内置处理。
      if (onExternalAction?.(action, engine) === true) return;
      switch (action.type) {
        case ActionType.START:
          engine.start();
          break;
        case ActionType.SCROLL: {
          const target = action.target ? engine.els.get(action.target) : null;
          if (action.target && !target) return;
          engine.start();
          // 为完整展开的标尺和吸顶导航预留空间，真实滚动事件负责推进施工前沿。
          const offset = NAV_HEIGHT * engine.vp.s + RULER_SIZE + 24;
          const top = target ? Math.max(0, target.y * engine.vp.s - offset) : 0;
          const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
          break;
        }
        case ActionType.DIALOG:
          setDialog({ kind: action.kind, title: action.title, plan: action.plan });
          break;
        default:
          break;
      }
    },
    [engine, onExternalAction]
  );

  /** 关闭弹窗，焦点与滚动位置的恢复由弹窗组件负责。 */
  const closeDialog = useCallback(() => {
    // 清空内容状态，让关闭按钮、遮罩和Esc共用同一条关闭路径。
    setDialog(null);
  }, []);

  return { dialog, onAction, closeDialog };
}
