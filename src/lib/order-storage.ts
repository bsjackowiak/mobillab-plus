import type { CartItem, OrderState } from "./types";
import { getPackageById } from "./packages";
import {
  getCachedOrder,
  setCachedOrder,
  archiveCurrentOrder,
} from "./session-cache";
import { scheduleSessionSync } from "./session-api";

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
      invoiceType: raw.invoiceType,
      invoicePersonal: raw.invoicePersonal,
      invoiceCompany: raw.invoiceCompany,
      items: raw.items,
    };
  }

  const items: CartItem[] = [];

  if (raw.packageId) {
    const pkg = getPackageById(raw.packageId);
    const productKey = `package:${raw.packageId}`;
    items.push({
      key: `unassigned:${productKey}`,
      productKey,
      kind: "package",
      packageId: raw.packageId,
      name: pkg?.name ?? raw.catalogName ?? raw.packageId,
      price: pkg?.price ?? raw.catalogPrice ?? null,
    });
  } else if (raw.catalogSlug) {
    const productKey = `catalog:${raw.catalogSlug}`;
    items.push({
      key: `unassigned:${productKey}`,
      productKey,
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
  setCachedOrder(merged);
  scheduleSessionSync();
}

export function getOrder(): OrderState | null {
  if (typeof window === "undefined") return null;
  return migrateOrder(getCachedOrder());
}

export function clearOrder(): void {
  if (typeof window === "undefined") return;
  setCachedOrder({ items: [] });
  scheduleSessionSync();
}

export function generateOrderNumber(): string {
  return `ML+${Math.floor(10000 + Math.random() * 90000)}`;
}

export { archiveCurrentOrder };
