import { describe, expect, it } from "vitest";
import { normalizeSession } from "@/lib/server/session-normalize";
import { parseSessionPutPayload } from "@/lib/server/session-schema";

describe("normalizeSession", () => {
  it("fills defaults for partial payload", () => {
    const normalized = normalizeSession(null);
    expect(normalized.order.items).toEqual([]);
    expect(normalized.patients).toEqual([]);
    expect(normalized.lastPatientId).toBeNull();
  });
});

describe("parseSessionPutPayload", () => {
  it("accepts minimal valid session", () => {
    const result = parseSessionPutPayload({
      order: { items: [] },
      patients: [],
      lastPatientId: null,
      completedOrders: [],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.patients).toEqual([]);
    }
  });

  it("rejects invalid patient email", () => {
    const result = parseSessionPutPayload({
      patients: [
        {
          id: "p1",
          fullName: "Jan Kowalski",
          email: "not-an-email",
          pesel: "44051401359",
        },
      ],
    });

    expect(result.ok).toBe(false);
  });

  it("rejects invalid PESEL", () => {
    const result = parseSessionPutPayload({
      patients: [
        {
          id: "p1",
          fullName: "Jan Kowalski",
          email: "jan@example.com",
          pesel: "12345678901",
        },
      ],
    });

    expect(result.ok).toBe(false);
  });

  it("accepts child identity with birth date and empty PESEL", () => {
    const result = parseSessionPutPayload({
      patients: [
        {
          id: "p-child",
          fullName: "Ala Nowak",
          email: "rodzic@example.com",
          pesel: "",
          birthDate: "2020-05-10",
          relation: "child",
          ageCategory: "child_4_12",
        },
      ],
    });

    expect(result.ok).toBe(true);
  });

  it("reprices cart items from catalog on session put", () => {
    const result = parseSessionPutPayload({
      order: {
        items: [
          {
            key: "k1",
            productKey: "catalog:morfologia-krwi-pelna",
            kind: "catalog",
            catalogSlug: "morfologia-krwi-pelna",
            name: "Morfologia krwi",
            price: 0.01,
            typ: "badanie",
          },
        ],
      },
      patients: [],
      lastPatientId: null,
      completedOrders: [],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.order.items[0]!.price).toBeGreaterThan(1);
    }
  });

  it("rejects session put with unknown catalog item", () => {
    const result = parseSessionPutPayload({
      order: {
        items: [
          {
            key: "k1",
            productKey: "catalog:fake",
            kind: "catalog",
            catalogSlug: "fake-slug",
            name: "Fake",
            price: 10,
          },
        ],
      },
    });

    expect(result.ok).toBe(false);
  });

  it("rejects oversized cart", () => {
    const items = Array.from({ length: 51 }, (_, index) => ({
      key: `k-${index}`,
      productKey: `p-${index}`,
      kind: "catalog" as const,
      name: "Badanie",
      price: 10,
    }));

    const result = parseSessionPutPayload({ order: { items } });
    expect(result.ok).toBe(false);
  });
});
