import { expect, test } from "@playwright/test";
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
