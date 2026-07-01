import type { CartItem, OrderState } from "./types";
import { getPackageById } from "./packages";

const ORDER_KEY = "labflow-order";

type LegacyOrder = OrderState & {
  packageId?: string;
  catalogSlug?: string;
  catalogId?: number;
  catalogName?: string;
  catalogPrice?: number | null;
};

function migrateOrder(raw: LegacyOrder | null): OrderState {
  if (!raw) return { items: [] };

  if (raw.items?.length) {
    return {
      orderNumber: raw.orderNumber,
      collectionType: raw.collectionType,
      facilityId: raw.facilityId,
      slot: raw.slot,
      homeAddress: raw.homeAddress,
      homeVisitPersonCount: raw.homeVisitPersonCount,
      location: raw.location,
      items: raw.items,
    };
  }

  const items: CartItem[] = [];

  if (raw.packageId) {
    const pkg = getPackageById(raw.packageId);
    items.push({
      key: `package:${raw.packageId}`,
      kind: "package",
      packageId: raw.packageId,
      name: pkg?.name ?? raw.catalogName ?? raw.packageId,
      price: pkg?.price ?? raw.catalogPrice ?? null,
    });
  } else if (raw.catalogSlug) {
    items.push({
      key: `catalog:${raw.catalogSlug}`,
      kind: "catalog",
      catalogSlug: raw.catalogSlug,
      catalogId: raw.catalogId,
      name: raw.catalogName ?? raw.catalogSlug,
      price: raw.catalogPrice ?? null,
      typ: "badanie",
    });
  }

  return {
    orderNumber: raw.orderNumber,
    slot: raw.slot,
    location: raw.location,
    items,
  };
}

export function saveOrder(order: Partial<OrderState>): void {
  if (typeof window === "undefined") return;
  const current = migrateOrder(getOrder());
  const merged: OrderState = {
    ...current,
    ...order,
    items: order.items ?? current.items,
  };
  sessionStorage.setItem(ORDER_KEY, JSON.stringify(merged));
}

export function getOrder(): OrderState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ORDER_KEY);
  if (!raw) return null;
  try {
    return migrateOrder(JSON.parse(raw) as LegacyOrder);
  } catch {
    return null;
  }
}

export function clearOrder(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ORDER_KEY);
}

export function generateOrderNumber(): string {
  return `ML+${Math.floor(10000 + Math.random() * 90000)}`;
}
