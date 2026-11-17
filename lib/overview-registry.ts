/**
 * 「返回全景」回调协调器。
 *
 * 博客弹框（BlogModalHost）是五套主题共享的组件，但「返回全景」只在 ASTRA
 * 主题下有真实语义——需要触发 astra store 的 RETURN 飞行状态机，让相机飞回
 * 全景。若让共享组件直接 import astra store，会把 R3F 依赖带进另外四套主题。
 *
 * 因此沿用 modal-registry 的中立协调器模式：ASTRA app 挂载时注册自己的
 * 返回回调，共享组件只管调用。非 ASTRA 主题未注册时，调用是安全的 no-op。
 */
type ReturnToOverviewFn = () => void;

let handler: ReturnToOverviewFn | null = null;

/** ASTRA 注册「返回全景」实现；返回注销函数，便于卸载时清理。 */
export function registerReturnToOverview(fn: ReturnToOverviewFn): () => void {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

/** 触发当前主题注册的「返回全景」；未注册时安全 no-op。 */
export function requestReturnToOverview(): void {
  handler?.();
}
