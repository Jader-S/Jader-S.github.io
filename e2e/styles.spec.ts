import { expect, test } from "@playwright/test";
import { STYLE_ROUTES, dismissCookieConsent, gotoStyle } from "./helpers";

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

  test("atelier exposes the unified seven-section layout", async ({ page }) => {
    await gotoStyle(page, "/atelier");

    for (const id of [
      "top",
      "about",
      "work",
      "work-index",
      "lab",
      "skills",
      "blog",
      "experience",
    ]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    // 合并前的 #selected 仍保留不可见别名锚点，旧链接不会失效。
    await expect(page.locator("#selected")).toBeAttached();
  });

  test("classic exposes the unified seven-section layout", async ({ page }) => {
    await gotoStyle(page, "/classic");

    for (const id of [
      "top",
      "about",
      "work",
      "github",
      "lab",
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

  test("lab is a top-level section with six demo cards across anchored styles", async ({
    page,
  }) => {
    for (const route of ["/atelier", "/classic", "/particle"]) {
      await gotoStyle(page, route);
      const lab = page.locator("#lab");
      await expect(lab).toBeAttached();
      await expect(lab.getByTestId("lab-card")).toHaveCount(6);
      // 导航里「实验室」与「作品」并列，不再是作品区里的小 chip。
      // atelier/classic 用 <a href="#lab">，particle 用 snap-scroll button。
      await expect(page.locator('#work [data-testid="lab-card"]')).toHaveCount(0);
      const nav = page.getByRole("navigation", { name: /主导航|Main navigation/ });
      await expect(nav.getByText(/实验室|Lab/).first()).toBeAttached();
    }
  });

  test("a lab demo returns straight to the page section", async ({ page }) => {
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);

    await page.locator("#lab").getByTestId("lab-card").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 1 })).toBeVisible();

    // Phase 8：从 #lab 进入的 Demo 点返回直接关闭弹框，不绕回 demo 列表。
    await dialog.getByRole("button", { name: /返回实验室|Back to lab/ }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator("#lab")).toBeAttached();
  });

  test("demo previews resolve the active theme tokens, not undefined ASTRA vars", async ({
    page,
  }) => {
    const resolved: string[] = [];
    for (const route of ["/atelier", "/classic", "/particle"]) {
      await gotoStyle(page, route);
      await dismissCookieConsent(page);
      await page.locator("#lab").getByTestId("lab-card").first().click();

      const host = page.locator("[data-demo-theme]");
      await expect(host).toBeAttached();
      const values = await host.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          accent: s.getPropertyValue("--neon-cyan").trim(),
          muted: s.getPropertyValue("--text-dim").trim(),
          radius: s.getPropertyValue("--radius-md").trim(),
          surface: s.getPropertyValue("--demo-surface-solid").trim(),
        };
      });
      // 这些变量原本只在 .astra-root 下定义；弹框 portal 到 body 后全部失效。
      expect(values.accent).toMatch(/^#/);
      expect(values.muted).toMatch(/^#/);
      expect(values.radius).toBe("12px");
      expect(values.surface).toContain("color-mix");
      resolved.push(values.accent);
    }
    // 不同风格的强调色必须不同，证明 demo 真的跟随当前主题。
    expect(new Set(resolved).size).toBeGreaterThan(1);
  });
});
