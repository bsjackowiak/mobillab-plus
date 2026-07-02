import { expect, test } from "@playwright/test";

test.describe("Checkout funnel entry", () => {
  test("home page loads and exposes search", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Mobillab");
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("cart page shows empty state", async ({ page }) => {
    await page.goto("/koszyk");
    await expect(page.getByRole("heading", { name: "Koszyk jest pusty" })).toBeVisible();
  });
});
