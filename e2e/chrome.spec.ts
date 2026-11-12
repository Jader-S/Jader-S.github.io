import { expect, test } from "@playwright/test";
import { dismissCookieConsent, gotoStyle } from "./helpers";

test.describe("theme and locale chrome", () => {
  test.beforeEach(async ({ page }) => {
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);
  });

  test("theme toggle switches data-theme and persists", async ({ page }) => {
    const themeGroup = page.getByRole("group", { name: /主题模式|Theme mode/ }).first();
    await themeGroup.getByRole("button", { name: /深色|Dark/i }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme-mode", "dark");

    await page.reload();
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme-mode", "dark");
  });

  test("locale toggle switches language and skip-link copy", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("link", { name: "跳到主要内容" })).toBeAttached();

    const localeGroup = page.getByRole("group", { name: "Language" }).first();
    await localeGroup.getByRole("button", { name: "English" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("data-locale", "en");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeAttached();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  });
});
