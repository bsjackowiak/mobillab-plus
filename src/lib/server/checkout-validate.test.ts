import { describe, expect, it } from "vitest";
import {
  computeServerGrandTotal,
  validateCheckoutConfirm,
  type ConfirmCheckoutBody,
} from "@/lib/server/checkout-validate";
import type { OrderState, PatientProfile } from "@/lib/types";

const patient: PatientProfile = {
  id: "p1",
  fullName: "Jan Kowalski",
  email: "jan@example.com",
  pesel: "44051401359",
};

const orderWithItem: OrderState = {
  items: [
    {
      key: "item-1",
      productKey: "pkg-1",
      kind: "package",
      packageId: "basic",
      name: "Pakiet podstawowy",
      price: 199,
      patientId: "p1",
    },
  ],
  collectionType: "facility",
  facilityId: "waw-1",
  location: "Warszawa",
};

const baseBody: ConfirmCheckoutBody = {
  invoiceType: "none",
  location: "Warszawa",
};

describe("validateCheckoutConfirm", () => {
  it("rejects empty cart", () => {
    expect(
      validateCheckoutConfirm({ items: [] }, [patient], baseBody, {
        paymentMode: "demo",
        demoAckRequired: false,
      }),
    ).toBe("Koszyk jest pusty");
  });

  it("rejects missing collection", () => {
    const order = { ...orderWithItem, collectionType: undefined, location: undefined };
    expect(
      validateCheckoutConfirm(order, [patient], { ...baseBody, location: "" }, {
        paymentMode: "demo",
        demoAckRequired: false,
      }),
    ).toBe("Brak wybranego pobrania");
  });

  it("accepts valid demo checkout", () => {
    expect(
      validateCheckoutConfirm(orderWithItem, [patient], baseBody, {
        paymentMode: "demo",
        demoAckRequired: false,
      }),
    ).toBeNull();
  });

  it("requires demo acknowledgement in demo mode when configured", () => {
    expect(
      validateCheckoutConfirm(orderWithItem, [patient], baseBody, {
        paymentMode: "demo",
        demoAckRequired: true,
      }),
    ).toBe("Potwierdź, że rozumiesz tryb demonstracyjny");
  });
});

describe("computeServerGrandTotal", () => {
  it("returns null for empty cart", () => {
    expect(computeServerGrandTotal({ items: [] })).toBeNull();
  });

  it("sums item prices for facility collection", () => {
    expect(computeServerGrandTotal(orderWithItem)).toBe(199);
  });
});
