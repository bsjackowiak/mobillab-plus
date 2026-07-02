import type { APIRequestContext, Page } from "@playwright/test";

const CONSENT_POLICY_VERSION = "2026-07-01";

export const TEST_PATIENT = {
  id: "p-e2e-test",
  fullName: "Jan Kowalski",
  email: "jan@example.com",
  pesel: "44051401359",
  relation: "self",
  ageCategory: "adult",
};

export const TEST_ORDER = {
  items: [
    {
      key: "p-e2e-test:catalog:morfologia",
      productKey: "catalog:morfologia",
      kind: "catalog",
      catalogSlug: "morfologia",
      name: "Morfologia krwi",
      price: 25,
      patientId: "p-e2e-test",
      typ: "badanie",
    },
  ],
  collectionType: "home",
  homeAddress: "ul. Testowa 1, Warszawa",
  slot: "08:00-10:00",
  homeVisitPersonCount: 1,
  invoiceType: "none",
};

export const TEST_SESSION = {
  order: TEST_ORDER,
  patients: [TEST_PATIENT],
  lastPatientId: TEST_PATIENT.id,
  completedOrders: [],
  updatedAt: new Date().toISOString(),
};

export async function seedBrowserSession(page: Page) {
  await page.addInitScript(
    ({ patient, order, consentVersion }) => {
      localStorage.setItem("mobillab-patients", JSON.stringify([patient]));
      localStorage.setItem("mobillab-last-patient", patient.id);
      localStorage.setItem(
        "mobillab-cookie-consent",
        JSON.stringify({
          version: consentVersion,
          decidedAt: new Date().toISOString(),
          preferences: { functional: false, analytics: false, marketing: false },
          source: "banner-reject-all",
        }),
      );
      sessionStorage.setItem("labflow-order", JSON.stringify(order));
    },
    {
      patient: TEST_PATIENT,
      order: TEST_ORDER,
      consentVersion: CONSENT_POLICY_VERSION,
    },
  );
}

export async function syncServerSession(request: APIRequestContext) {
  const response = await request.put("/api/session", { data: TEST_SESSION });
  if (!response.ok()) {
    throw new Error(`Session seed failed: ${response.status()} ${await response.text()}`);
  }
}

export async function prepareFunnelPage(page: Page) {
  await seedBrowserSession(page);
  await page.goto("/");
  await dismissCookieBannerIfVisible(page);
  await syncServerSession(page.request);
}

export async function dismissCookieBannerIfVisible(page: Page) {
  const reject = page.getByRole("button", { name: "Odrzuć wszystkie" });
  if (await reject.isVisible().catch(() => false)) {
    await reject.click();
  }
}
