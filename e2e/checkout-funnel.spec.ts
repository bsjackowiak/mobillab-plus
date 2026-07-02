import { expect, test } from "@playwright/test";
import { dismissCookieBannerIfVisible, prepareFunnelPage } from "./helpers/session";

test.describe("Checkout funnel (demo)", () => {
  test.beforeEach(async ({ page }) => {
    await prepareFunnelPage(page);
  });

  test("checkout page loads with seeded cart", async ({ page }) => {
    await page.goto("/checkout");
    await dismissCookieBannerIfVisible(page);
    await expect(page.getByRole("heading", { name: "Płatność" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Morfologia krwi")).toBeVisible();
    await expect(page.getByText("Jan Kowalski · 25 zł")).toBeVisible();
  });

  test("completes demo order through payment", async ({ page }) => {
    await page.goto("/checkout");
    await dismissCookieBannerIfVisible(page);
    await expect(page.getByRole("heading", { name: "Płatność" })).toBeVisible({ timeout: 20_000 });

    await page
      .getByRole("checkbox", {
        name: /Rozumiem — to zamówienie demonstracyjne bez realnej płatności/,
      })
      .check();

    await page.getByRole("button", { name: /Potwierdź zamówienie \(demo\)/ }).click();

    await expect(page).toHaveURL(/\/sukces\//, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Gotowe!" })).toBeVisible();
    await expect(page.getByText("Numer zamówienia")).toBeVisible();
  });
});
