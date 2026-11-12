import { type Page, expect } from "@playwright/test";

export const STYLE_ROUTES = [
  "/atelier",
  "/classic",
  "/particle",
  "/blueprint",
] as const;

export type StyleRoute = (typeof STYLE_ROUTES)[number];

const STORAGE_KEYS = [
  "portfolio-theme",
  "portfolio-locale",
  "portfolio-style",
  "portfolio-cookie-consent",
] as const;

/** Clear preference keys on the current origin (call after a same-origin navigation). */
export async function clearClientStorage(page: Page) {
  await page.evaluate(
    (keys) => {
      for (const key of keys) localStorage.removeItem(key);
    },
    [...STORAGE_KEYS]
  );
}

/**
 * Open a style route with a clean preference state.
 * Clears storage once, then reloads so init scripts see the empty state.
 * Blueprint stays on the drawn page. Other styles expose #main-content.
 */
export async function gotoStyle(page: Page, route: StyleRoute) {
  await page.goto(route);
  await clearClientStorage(page);
  await page.reload();
  if (route === "/blueprint") {
    await expect(page.locator(".swarm-experience")).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("navigation", { name: /主导航|Main navigation/ })
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("button", { name: /跳过动画|Skip animation/i })
    ).toHaveCount(0);
  } else {
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });
  }
  await expect(page.locator("html")).toHaveAttribute("data-style", route.slice(1));
}

export async function dismissCookieConsent(page: Page) {
  const consent = page.locator(
    '[role="dialog"][aria-labelledby="cookie-consent-title"]'
  );
  if (await consent.isVisible().catch(() => false)) {
    await consent
      .getByRole("button")
      .filter({ hasText: /接受|Accept/i })
      .click();
    await expect(consent).toBeHidden();
  }
}
