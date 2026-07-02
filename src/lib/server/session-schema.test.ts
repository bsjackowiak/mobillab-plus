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
