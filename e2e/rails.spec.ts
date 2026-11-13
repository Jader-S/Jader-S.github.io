import { expect, test, type Page } from "@playwright/test";
import { dismissCookieConsent, gotoStyle } from "./helpers";

test.describe("style rail and skill share", () => {
  test.beforeEach(async ({ page }) => {
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);
  });

  test("style rail switches style in the same tab", async ({ page }) => {
    const styleNav = page.getByRole("navigation", { name: /页面风格|Page style/ });
    await expect(styleNav.getByRole("link", { name: "静奢" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    await styleNav.getByRole("link", { name: "经典" }).click();
    await expect(page).toHaveURL(/\/classic\/?$/);
    await expect(page.locator("html")).toHaveAttribute("data-style", "classic");
  });

  test("skill share copies prompt to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.getByRole("button", { name: /复制 Skill|Copy skill/i }).click();
    await expect(page.getByRole("tooltip")).toContainText(/已复制|Copied/i);

    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain("https://github.com/Jader-S/astra-portfolio");
    expect(text).toContain("/portfolio-atelier");
  });
});

test.describe("mobile style drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);
  });

  const handle = (page: Page) =>
    page.getByRole("button", { name: /展开风格切换|Open style switcher/i });
  const drawer = (page: Page) =>
    page.getByRole("dialog", { name: /切换页面风格|Switch page style/i });

  test("collapses the desktop rail and switches style in the same tab", async ({
    page,
  }) => {
    await expect(
      page.getByRole("navigation", { name: /页面风格|Page style/i })
    ).toBeHidden();

    await expect(handle(page)).toBeVisible();
    await handle(page).click();
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page).getByRole("link")).toHaveCount(5);

    await drawer(page)
      .getByRole("link", { name: /经典|Classic/i })
      .click();
    await expect(page).toHaveURL(/\/classic\/?$/);
    await expect(page.locator("html")).toHaveAttribute("data-style", "classic");
  });

  test("dismisses with Escape and the overlay", async ({ page }) => {
    await handle(page).click();
    await expect(drawer(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toBeHidden();

    await handle(page).click();
    await expect(drawer(page)).toBeVisible();
    // Right of the drawer panel (min(82vw, 18rem) = 288px on a 390px screen).
    await page.mouse.click(360, 400);
    await expect(drawer(page)).toBeHidden();
  });
});
