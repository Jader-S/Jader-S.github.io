import { expect, test } from "@playwright/test";
import { clearClientStorage, dismissCookieConsent, gotoStyle } from "./helpers";

test.describe("navigation and cookies", () => {
  test("desktop nav jumps to a section", async ({ page }) => {
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);

    const nav = page.getByRole("navigation", { name: /主导航|Main navigation/ });
    await nav.getByRole("link", { name: "关于" }).click();
    await expect(page.locator("#about")).toBeInViewport();
  });

  test("mobile menu opens and lists nav links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);

    const openMenu = page.getByRole("button", { name: /打开菜单|Open menu/i });
    await openMenu.click();
    await expect(page.getByRole("button", { name: /关闭菜单|Close menu/i })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "博客" })).toBeVisible();
  });

  test("cookie consent can be accepted and stays dismissed", async ({ page }) => {
    await page.goto("/atelier");
    await clearClientStorage(page);
    await page.reload();
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });

    const consent = page.locator('[role="dialog"][aria-labelledby="cookie-consent-title"]');
    await expect(consent).toBeVisible();
    await consent.getByRole("button", { name: "全部接受" }).click();
    await expect(consent).toBeHidden();

    await page.reload();
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });
    await expect(consent).toBeHidden();
  });
});
