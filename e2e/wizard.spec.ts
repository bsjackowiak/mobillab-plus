import { expect, test } from "@playwright/test";
import { dismissCookieBannerIfVisible, installCookieConsent } from "./helpers/session";

test.describe("Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await installCookieConsent(page);
  });

  test("loads first question", async ({ page }) => {
    await page.goto("/wizard");
    await dismissCookieBannerIfVisible(page);
    await expect(page.getByRole("heading", { name: "Co Cię najbardziej niepokoi?" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Zmęczenie i brak energii" })).toBeVisible();
  });

  test("reaches package recommendation after three answers", async ({ page }) => {
    await page.goto("/wizard");
    await dismissCookieBannerIfVisible(page);

    await page.getByRole("option", { name: "Zmęczenie i brak energii" }).click();
    await expect(page.getByRole("heading", { name: "Od kiedy występuje ten problem?" })).toBeVisible();
    await page.getByRole("option", { name: "Około miesiąca" }).click();

    await expect(page.getByRole("heading", { name: /profilaktycznie/i })).toBeVisible();
    await page.getByRole("option", { name: "Mam objawy" }).click();

    await expect(page.getByRole("heading", { name: "Polecamy ten pakiet" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Dodaj do koszyka/ })).toBeVisible();
  });
});
