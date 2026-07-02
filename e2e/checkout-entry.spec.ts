import { expect, test } from "@playwright/test";
import { dismissCookieBannerIfVisible } from "./helpers/session";

test.describe("Checkout funnel entry", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "mobillab-cookie-consent",
        JSON.stringify({
          version: "2026-07-01",
          decidedAt: new Date().toISOString(),
          preferences: { functional: false, analytics: false, marketing: false },
          source: "banner-reject-all",
        }),
      );
    });
  });

  test("home page loads and exposes search", async ({ page }) => {
    await page.goto("/");
    await dismissCookieBannerIfVisible(page);
    await expect(page.getByRole("heading", { name: /Co chcesz/i })).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("cart page shows empty state", async ({ page }) => {
    await page.goto("/koszyk");
    await dismissCookieBannerIfVisible(page);
    await expect(page.getByRole("heading", { name: "Koszyk jest pusty" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe("ok");
  });
});
