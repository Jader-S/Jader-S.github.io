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

  test("atelier exposes the unified six-section layout", async ({ page }) => {
    await gotoStyle(page, "/atelier");

    for (const id of [
      "top",
      "about",
      "work",
      "work-index",
      "skills",
      "blog",
      "experience",
    ]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    // 合并前的 #selected 仍保留不可见别名锚点，旧链接不会失效。
    await expect(page.locator("#selected")).toBeAttached();
  });

  test("classic exposes the unified six-section layout", async ({ page }) => {
    await gotoStyle(page, "/classic");

    for (const id of [
      "top",
      "about",
      "work",
      "github",
      "skills",
      "blog",
      "experience",
    ]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    // 企业项目段的旧 #enterprise 锚点保留为 #work 内的别名。
    await expect(page.locator("#enterprise")).toBeAttached();
  });

  test("blueprint keeps the drawn page and has no skip control", async ({ page }) => {
    await gotoStyle(page, "/blueprint");

    await expect(page.locator(".swarm-experience")).toBeVisible();
    await expect(page.locator("#main-content")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /跳过动画|Skip animation/i })
    ).toHaveCount(0);
  });

  test("works are a single merged list across anchored styles", async ({ page }) => {
    for (const route of ["/atelier", "/classic", "/particle"]) {
      await gotoStyle(page, route);
      const work = page.locator("#work");
      await expect(work).toBeAttached();
      // 4 entries, no enterprise / open-source split, no ASTRA portfolio card.
      await expect(work.getByTestId("project-card")).toHaveCount(4);
      await expect(work).not.toContainText(/ASTRA · 3D 星图作品站|ASTRA · 3D Galaxy/);
      await expect(work).not.toContainText(
        /近期企业项目|开源项目|Recent Enterprise|Open Source Projects/
      );
    }
  });
});
