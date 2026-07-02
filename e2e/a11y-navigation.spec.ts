import { expect, test } from "@playwright/test";
import { dismissCookieBannerIfVisible, installCookieConsent } from "./helpers/session";

test.describe("Accessibility navigation", () => {
  test.beforeEach(async ({ page }) => {
    await installCookieConsent(page);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await dismissCookieBannerIfVisible(page);

    const skipLink = page.getByRole("link", { name: "Przejdź do treści" });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    await skipLink.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
});
