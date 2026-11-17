"use client";

import { create } from "zustand";
import { closeOtherModals, registerModal } from "./modal-registry";

export type BlogModalView =
  | { kind: "closed" }
  | { kind: "post"; slug: string }
  | { kind: "index" };

interface BlogModalStore {
  view: BlogModalView;
  openBlog: (slug: string) => void;
  openBlogIndex: () => void;
  closeBlog: () => void;
}

/**
 * 博客弹框的外部 store。
 *
 * 故意不用 React Context：ASTRA 的 <Canvas> 走 R3F 独立 reconciler，
 * Context 穿透不可靠；blueprint 的绘制动画引擎也脱离 React 树发起动作。
 * 用外部 store + 命令式 API，任何位置都能触发弹框，Host 只负责订阅渲染。
 */
function closeSelf() {
  useBlogModalStore.getState().closeBlog();
}

export const useBlogModalStore = create<BlogModalStore>((set) => ({
  view: { kind: "closed" },
  openBlog: (slug) => {
    // 打开博客弹框时先关掉 project/demo 弹框，保证两个 dialog 互斥。
    closeOtherModals(closeSelf);
    set({ view: { kind: "post", slug } });
  },
  openBlogIndex: () => {
    closeOtherModals(closeSelf);
    set({ view: { kind: "index" } });
  },
  closeBlog: () => set({ view: { kind: "closed" } }),
}));

// 把自己的关闭能力注册进中立协调器，供 project-modal 反向调用。
registerModal(closeSelf);

/** 打开单篇正文。 */
export const openBlog = (slug: string) => useBlogModalStore.getState().openBlog(slug);

/** 打开全部日志列表（ASTRA 的「日志」星球入口）。 */
export const openBlogIndex = () => useBlogModalStore.getState().openBlogIndex();

/** 关闭弹框。 */
export const closeBlog = () => useBlogModalStore.getState().closeBlog();
