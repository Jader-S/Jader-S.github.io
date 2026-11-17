import { expect, test } from "@playwright/test";
import { gotoStyle } from "./helpers";

/**
 * astra 是原生 3D 主题（R3F + drei），DOM 结构与另外四套模板主题不同：
 * 没有锚点主导航、没有 SkillShare 按钮，入口是场景里的 3D 星球 chip。
 * 另外 chip 随相机自主漂移，Playwright 的 stability 检查永远等不到元素静止，
 * 因此统一用 dispatchEvent('click') 触发同一个 React onClick。
 */
test.describe("astra (native 3D style)", () => {
  test("opens the blog index from the 3D LOGOS chip", async ({ page }) => {
    await gotoStyle(page, "/astra");

    const chip = page.locator('.planet-chip[aria-label="前往 LOGOS"]');
    await expect(chip).toBeAttached({ timeout: 30_000 });
    await chip.dispatchEvent("click");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toContainText(/共 18 篇|18 posts/);
    await expect(page).toHaveURL(/\/astra\/?$/);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("toggles language from the nav rail on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStyle(page, "/astra");

    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    const lang = page.locator(".nav-rail__lang").first();
    await expect(lang).toBeVisible({ timeout: 30_000 });
    await expect(lang).toHaveText("EN");

    await lang.click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("data-locale", "en");
    await expect(lang).toHaveText("ZH");
  });

  test("skip link targets the astra root", async ({ page }) => {
    await gotoStyle(page, "/astra");

    await expect(page.locator(".skip-link")).toHaveAttribute("href", "#main-content");
    const main = page.locator("#main-content");
    await expect(main).toBeAttached();
    await expect(main).toHaveAttribute("tabindex", "-1");
  });

  test("has no unexpected console errors", async ({ page }) => {
    const unexpected: string[] = [];
    const knownStrictModeWarnings: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      // pmndrs/drei#2867：drei 10.7.9 的 <Html> 在 React 19 StrictMode 下，
      // 于 layout effect cleanup 里同步 unmount root。dev-only、生产无影响。
      // 实测固定 6 次（初次挂载的 6 个 Html），不随飞行/弹框交互增长。
      if (text.includes("Attempted to synchronously unmount a root")) {
        knownStrictModeWarnings.push(text);
        return;
      }
      unexpected.push(text);
    });

    await gotoStyle(page, "/astra");
    await expect(page.locator('.planet-chip[aria-label="前往 LOGOS"]')).toBeAttached({
      timeout: 30_000,
    });
    await page.waitForTimeout(1500);

    expect(unexpected).toEqual([]);
    // 已知告警必须有界：上游行为变化导致告警失控增长时这里会失败。
    expect(knownStrictModeWarnings.length).toBeLessThanOrEqual(6);
  });
});
