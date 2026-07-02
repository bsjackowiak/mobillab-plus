import { describe, expect, it } from "vitest";
import {
  repriceCartItems,
  repriceOrder,
  resolveCartItemPrice,
} from "@/lib/server/order-pricing";

describe("resolveCartItemPrice", () => {
  it("resolves package price from catalog", () => {
    expect(
      resolveCartItemPrice({
        kind: "package",
        packageId: "control",
      }),
    ).toBe(199);
  });

  it("resolves catalog price by slug", () => {
    const price = resolveCartItemPrice({
      kind: "catalog",
      catalogSlug: "morfologia-krwi-pelna",
    });
    expect(price).toBeGreaterThan(0);
  });

  it("rejects unknown catalog slug", () => {
    expect(
      resolveCartItemPrice({
        kind: "catalog",
        catalogSlug: "nie-istnieje-xyz",
      }),
    ).toBeNull();
  });

  it("rejects tampered client price path for unknown package", () => {
    expect(
      resolveCartItemPrice({
        kind: "package",
        packageId: "basic",
      }),
    ).toBeNull();
  });
});

describe("repriceCartItems", () => {
  it("overwrites client-supplied price with catalog price", () => {
    const result = repriceCartItems([
      {
        key: "k1",
        productKey: "catalog:morfologia-krwi-pelna",
        kind: "catalog",
        catalogSlug: "morfologia-krwi-pelna",
        name: "Morfologia krwi",
        price: 0.01,
        typ: "badanie",
      },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0]!.price).toBeGreaterThan(1);
      expect(result.items[0]!.price).not.toBe(0.01);
    }
  });

  it("rejects items that cannot be resolved", () => {
    const result = repriceCartItems([
      {
        key: "k1",
        productKey: "catalog:fake",
        kind: "catalog",
        catalogSlug: "fake-slug",
        name: "Fake",
        price: 10,
      },
    ]);
    expect(result.ok).toBe(false);
  });
});

describe("repriceOrder", () => {
  it("reprices all order items", () => {
    const result = repriceOrder({
      items: [
        {
          key: "k1",
          productKey: "pkg:control",
          kind: "package",
          packageId: "control",
          name: "Pakiet kontrolny",
          price: 1,
        },
      ],
      collectionType: "facility",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.items[0]!.price).toBe(199);
    }
  });
});
