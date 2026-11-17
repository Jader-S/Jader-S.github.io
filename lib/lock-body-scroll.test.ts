import { describe, expect, it } from "vitest";
import { lockBodyScroll } from "./lock-body-scroll";

describe("lockBodyScroll", () => {
  it("keeps the body locked until the last holder releases", () => {
    document.body.style.overflow = "scroll";
    document.body.style.paddingRight = "";

    const releaseA = lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");

    const releaseB = lockBodyScroll();
    releaseA();
    // 还有一个持有者，不能提前解锁。
    expect(document.body.style.overflow).toBe("hidden");

    releaseB();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("release is idempotent and only the first lock snapshots the original value", () => {
    document.body.style.overflow = "auto";

    const releaseA = lockBodyScroll();
    const releaseB = lockBodyScroll();
    releaseA();
    releaseA(); // 重复释放不应把计数扣成负数或提前解锁
    expect(document.body.style.overflow).toBe("hidden");

    releaseB();
    expect(document.body.style.overflow).toBe("auto");
  });
});
