import { expect, test } from "@playwright/test";
import { STYLE_ROUTES, gotoStyle } from "./helpers";

test.describe("style pages", () => {
  for (const route of STYLE_ROUTES) {
    test(`${route} loads main content and chrome rails`, async ({ page }) => {
      await gotoStyle(page, route);

      await expect(
        page.getByRole("navigation", { name: /页面风格|Page style/ })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /复制 Skill|Copy skill/i })
      ).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: /主导航|Main navigation/ })
      ).toBeVisible();
    });
  }

  test("atelier exposes core sections", async ({ page }) => {
    await gotoStyle(page, "/atelier");

    for (const id of ["selected", "about", "skills", "blog", "experience"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("classic exposes classic sections", async ({ page }) => {
    await gotoStyle(page, "/classic");

    for (const id of ["about", "skills", "blog", "experience"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("blueprint keeps the drawn page and has no skip control", async ({ page }) => {
    await gotoStyle(page, "/blueprint");

    await expect(page.locator(".swarm-experience")).toBeVisible();
    await expect(page.locator("#main-content")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /跳过动画|Skip animation/i })
    ).toHaveCount(0);
  });
});
