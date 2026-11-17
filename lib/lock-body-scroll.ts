/**
 * 全局 body 滚动锁（引用计数）。
 *
 * 弹框、移动端抽屉、移动菜单可能叠加打开。若每个浮层各自快照并恢复
 * body.style.overflow，先关闭的那个会把锁提前释放，导致仍打开的浮层背后
 * 页面可以滚动。这里用引用计数保证「最后一个持有者释放时才真正解锁」，
 * 且只在首次上锁时快照原值与补滚动条宽度。
 */
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

/** 上锁并返回释放函数；释放函数可安全重复调用。 */
export function lockBodyScroll(): () => void {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;

    // 补上滚动条宽度，避免锁定时背景页面横向跳动。
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    }
  };
}
