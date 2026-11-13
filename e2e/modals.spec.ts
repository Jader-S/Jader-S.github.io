import { expect, test } from "@playwright/test";
import { dismissCookieConsent, gotoStyle } from "./helpers";

test.describe("in-page modals (atelier)", () => {
  test.beforeEach(async ({ page }) => {
    await gotoStyle(page, "/atelier");
    await dismissCookieConsent(page);
  });

  test("blog card opens the in-page modal instead of a route", async ({ page }) => {
    const card = page.getByTestId("blog-card").first();
    await expect(card).toBeVisible();
    await card.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    // The post heading rendered inside the modal (not a new page).
    await expect(dialog.getByRole("heading", { level: 1 })).toBeVisible();

    // No navigation away from the style page.
    await expect(page).toHaveURL(/\/atelier\/?$/);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("project card opens details, then an inline demo preview", async ({ page }) => {
    const card = page.getByTestId("project-card").first();
    await expect(card).toBeVisible();
    await card.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Project detail shows a demos section.
    await expect(dialog.getByTestId("demo-item").first()).toBeVisible();

    // Open the first linked demo as an inline preview (same page, no new tab).
    await dialog.getByTestId("demo-item").first().click();
    await expect(dialog.getByTestId("demo-preview")).toBeVisible();
    await expect(dialog.getByText(/返回项目|Back to project/i)).toBeVisible();

    // Return to the project detail, then close.
    await dialog.getByText(/返回项目|Back to project/i).click();
    await expect(dialog.getByTestId("demo-item").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
