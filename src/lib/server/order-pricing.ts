import {
  getCatalogItemById,
  getCatalogItemBySlug,
  getCatalogPrice,
} from "@/lib/catalog";
import { getPackageById } from "@/lib/packages";
import type { CartItem, OrderState } from "@/lib/types";

export type RepriceFailure = { ok: false; error: string };

export function resolveCartItemPrice(
  item: Pick<CartItem, "kind" | "packageId" | "catalogSlug" | "catalogId">,
): number | null {
  if (item.kind === "package") {
    if (!item.packageId) return null;
    return getPackageById(item.packageId)?.price ?? null;
  }

  if (item.kind === "catalog") {
    const bySlug = item.catalogSlug ? getCatalogItemBySlug(item.catalogSlug) : undefined;
    const catalogItem =
      bySlug ?? (item.catalogId != null ? getCatalogItemById(item.catalogId) : undefined);
    return catalogItem ? getCatalogPrice(catalogItem) : null;
  }

  return null;
}

export function repriceCartItems(
  items: CartItem[],
): { ok: true; items: CartItem[] } | RepriceFailure {
  const repriced: CartItem[] = [];

  for (const item of items) {
    const price = resolveCartItemPrice(item);
    if (price == null) {
      return { ok: false, error: "Invalid cart item" };
    }
    repriced.push({ ...item, price });
  }

  return { ok: true, items: repriced };
}

export function repriceOrder(
  order: OrderState,
): { ok: true; order: OrderState } | RepriceFailure {
  const result = repriceCartItems(order.items);
  if (!result.ok) return result;
  return { ok: true, order: { ...order, items: result.items } };
}
