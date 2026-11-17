/**
 * 弹框互斥协调器。
 *
 * blog-modal 与 project-modal 是两个独立的 zustand store，二者都要保证
 * 「打开自己时关闭对方」。若让它们互相 import 会形成循环依赖，因此把
 * 「关闭自己」的能力注册进这个中立模块，由它统一执行互斥，确保任何时刻
 * 最多只有一个 dialog 处于打开状态。
 */
type CloseFn = () => void;

const closers = new Set<CloseFn>();

/** 注册一个弹框的关闭函数；返回注销函数，便于测试之间隔离。 */
export function registerModal(close: CloseFn): () => void {
  closers.add(close);
  return () => {
    closers.delete(close);
  };
}

/** 关闭除 keep 之外的所有已注册弹框。 */
export function closeOtherModals(keep: CloseFn): void {
  closers.forEach((close) => {
    if (close !== keep) close();
  });
}
