import { expect, test } from "@playwright/test";
import { STYLE_ROUTES, dismissCookieConsent, gotoStyle } from "./helpers";

// 与 demoCatalog 同步；新增 Demo 时改这里一处。
const DEMO_COUNT = 7;

test.describe("style pages", () => {
  for (const route of STYLE_ROUTES) {
    test(`${route} loads main content and chrome rails`, async ({ page }) => {
      await gotoStyle(page, route);

      await expect(
        page.getByRole("navigation", { name: /页面风格|Page style/ })
      ).toBeVisible();
      if (route === "/astra") {
        // astra 是原生 3D 主题，没有模板主题的 SkillShare 按钮与锚点主导航；
        // 入口是场景内的 3D 星球 chip（细节见 astra.spec.ts）。
        await expect(
          page.locator('.planet-chip[aria-label="前往 ORIGO"]')
        ).toBeAttached();
      } else {
        await expect(
          page.getByRole("button", { name: /复制 Skill|Copy skill/i })
        ).toBeVisible();
        await expect(
          page.getByRole("navigation", { name: /主导航|Main navigation/ })
        ).toBeVisible();
      }
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

  test("blueprint keeps the drawn page and exposes the skip target", async ({ page }) => {
    await gotoStyle(page, "/blueprint");

    await expect(page.locator(".swarm-experience")).toBeVisible();
    await expect(page.locator("#main-content")).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: /跳过动画|Skip animation/i })
    ).toHaveCount(0);
  });

  test("blueprint drawn lab places every demo card", async ({ page }) => {
    await gotoStyle(page, "/blueprint");
    // 场景元素随滚动施工挂载：滚到 lab 帧（2140–2860）让全部 7 张卡片出现。
    await page.evaluate(() => window.scrollTo(0, 2500));
    await expect(
      page.locator('[data-element-id="lab-t~6"]')
    ).toBeAttached({ timeout: 60_000 });
    await expect(
      page.locator('[data-element-id^="lab-t"]')
    ).toHaveCount(DEMO_COUNT);
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

  test("lab is a top-level section with all demo cards across anchored styles", async ({
    page,
  }) => {
    for (const route of ["/atelier", "/classic", "/particle"]) {
      await gotoStyle(page, route);
      const lab = page.locator("#lab");
      await expect(lab).toBeAttached();
      await expect(lab.getByTestId("lab-card")).toHaveCount(DEMO_COUNT);
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
      // 现在由 demo 桥接层解析为有效色值：纯 hex 或 color-mix（含 hex）都算解析成功。
      expect(values.accent).toMatch(/^#|color-mix/);
      expect(values.muted).toMatch(/^#|color-mix/);
      expect(values.radius).toBe("12px");
      expect(values.surface).toContain("color-mix");
      resolved.push(values.accent);
    }
    // 不同风格的强调色必须不同，证明 demo 真的跟随当前主题。
    expect(new Set(resolved).size).toBeGreaterThan(1);
  });

  test("skill QA agent preview loads its local standalone app", async ({
    page,
  }) => {
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);

    const card = page
      .locator('#lab [data-testid="lab-card"]')
      .filter({ hasText: /技能问答|Skill QA/ });
    await expect(card).toHaveCount(1);
    await card.click();

    const frame = page.locator('iframe[title*="技能问答"]');
    await expect(frame).toBeVisible({ timeout: 15_000 });
    await expect(frame).toHaveAttribute("src", /\/qa-agent\/index\.html$/);
    // iframe 是独立 Vite 应用：确认它真的挂载，而不只是空壳。
    await expect
      .poll(
        async () =>
          page
            .frameLocator('iframe[title*="技能问答"]')
            .locator("body")
            .evaluate((b) => (b.textContent || "").includes("模拟面试")),
        { timeout: 20_000 }
      )
      .toBe(true);
  });

  test("every anchored style can open the full post index directly", async ({
    page,
  }) => {
    for (const route of ["/atelier", "/classic", "/particle"]) {
      await gotoStyle(page, route);
      await dismissCookieConsent(page);

      // 不再需要「先点进单篇 → 返回列表」：博客区底部就有「全部日志」直达入口。
      const entry = page.getByRole("button", { name: /全部日志|All posts/ });
      await expect(entry).toHaveCount(1);
      // 按钮在长页底部，坐标点击会被固定导航遮挡；直接派发 click 事件验证入口逻辑。
      await entry.dispatchEvent("click");

      const dialog = page.getByRole("dialog", { name: /技术日志|Engineering Notes/ });
      await expect(dialog).toBeVisible();
      // 动态渲染全部 18 篇，而不是当前主题下的某一批。
      await expect(dialog.locator("ul li")).toHaveCount(18);
      await expect(dialog).toContainText(/共 18 篇|18 posts/);

      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
  });

  test("blueprint drawn blog rows follow the newest posts, not a fixed theme", async ({
    page,
  }) => {
    await gotoStyle(page, "/blueprint");
    await page.waitForTimeout(2500);

    // 场景随滚动施工：小步滚过 blog 帧，等 4 行全部挂载（施工动画有节奏延迟）。
    const rowSelector =
      '[data-element-id="b0"], [data-element-id="b1"], [data-element-id="b2"], [data-element-id="b3"]';
    await expect
      .poll(
        async () => {
          const y = await page.evaluate(() => window.scrollY);
          await page.evaluate((top) => window.scrollTo(0, top + 220), y);
          return page.locator(rowSelector).count();
        },
        { timeout: 90_000, intervals: [600] }
      )
      .toBe(4);

    // 首行必须是全站最新一篇（按日期倒序），不再是被主题过滤后的旧文章。
    await expect(page.locator('[data-element-id="b0"]')).toHaveText(
      /Portal 之后，颜色全失效了|After Portal, every colour broke/
    );

    // 画布博客区内的「全部日志」入口（与其他主题博客区同构）：等文字施工完成后出现交互按钮。
    const canvasEntry = page.locator('[data-interaction-id="b-all"]');
    await expect
      .poll(async () => canvasEntry.count(), { timeout: 30_000, intervals: [600] })
      .toBe(1);
    await expect(canvasEntry).toHaveAttribute(
      "aria-label",
      /全部日志.*共 18 篇|All posts.*18/
    );
    await canvasEntry.dispatchEvent("click");
    const dialog = page.getByRole("dialog", { name: /技术日志|Engineering Notes/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("ul li")).toHaveCount(18);

    // 工具栏的 compact 入口同样存在（双重入口，不冲突）。
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    const toolbarEntry = page.getByRole("button", { name: /全部日志|All posts/ });
    await expect(await toolbarEntry.count()).toBeGreaterThanOrEqual(1);
  });
});
