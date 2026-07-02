import type { CartItem, OrderState } from "./types";
import { archiveCurrentOrder, getOrder, saveOrder } from "./order-storage";

export const UNASSIGNED_PATIENT = "unassigned";

export function productCartKey(slugOrId: string, kind: "catalog" | "package"): string {
  return kind === "catalog" ? `catalog:${slugOrId}` : `package:${slugOrId}`;
}

export function catalogCartKey(slug: string): string {
  return productCartKey(slug, "catalog");
}

export function packageCartKey(packageId: string): string {
  return productCartKey(packageId, "package");
}

export function lineCartKey(productKey: string, patientId?: string): string {
  return `${patientId ?? UNASSIGNED_PATIENT}:${productKey}`;
}

export function getProductKey(
  item: Pick<CartItem, "productKey" | "key" | "kind" | "catalogSlug" | "packageId">,
): string {
  if (item.productKey) return item.productKey;
  if (item.kind === "package" && item.packageId) return packageCartKey(item.packageId);
  if (item.catalogSlug) return catalogCartKey(item.catalogSlug);

  const key = item.key;
  if (key.startsWith(`${UNASSIGNED_PATIENT}:`)) {
    return key.slice(UNASSIGNED_PATIENT.length + 1);
  }

  const firstColon = key.indexOf(":");
  if (firstColon > 0) {
    const prefix = key.slice(0, firstColon);
    if (prefix !== "catalog" && prefix !== "package") {
      return key.slice(firstColon + 1);
    }
  }

  return key;
}

export function normalizeCartItem(item: CartItem): CartItem {
  const productKey = getProductKey(item);
  let patientId = item.patientId;

  if (!patientId) {
    const prefix = item.key.split(":")[0];
    if (
      prefix &&
      prefix !== "catalog" &&
      prefix !== "package" &&
      prefix !== UNASSIGNED_PATIENT
    ) {
      patientId = prefix;
    }
  }

  return {
    ...item,
    productKey,
    patientId: patientId || undefined,
    key: lineCartKey(productKey, patientId),
  };
}

function normalizeCartItems(items: CartItem[]): CartItem[] {
  return items.map(normalizeCartItem);
}

export function getCart(): OrderState {
  const order = getOrder() ?? { items: [] };
  return { ...order, items: normalizeCartItems(order.items) };
}

export function getCartItems(): CartItem[] {
  return getCart().items;
}

export function getCartCount(): number {
  return getCartItems().length;
}

export function getCartTotal(): number | null {
  const items = getCartItems();
  if (items.length === 0) return null;
  let total = 0;
  for (const item of items) {
    if (item.price == null) return null;
    total += item.price;
  }
  return total;
}

export function cartHasItems(): boolean {
  return getCartCount() > 0;
}

export function isInCart(key: string): boolean {
  return getCartItems().some((i) => i.key === key);
}

export function isProductInCartForPatient(productKey: string, patientId?: string): boolean {
  const key = lineCartKey(productKey, patientId);
  return isInCart(key);
}

export function getCartLinesForProduct(productKey: string): CartItem[] {
  return getCartItems().filter((item) => getProductKey(item) === productKey);
}

export function allPatientsHaveProduct(
  productKey: string,
  patientIds: string[],
): boolean {
  if (patientIds.length === 0) return false;
  return patientIds.every((id) => isProductInCartForPatient(productKey, id));
}

export function addCartItem(item: CartItem): boolean {
  const normalized = normalizeCartItem(item);
  const order = getCart();

  if (order.items.some((i) => i.key === normalized.key)) {
    return false;
  }

  saveOrder({ items: [...order.items, normalized] });
  notifyCartChange();
  return true;
}

export function addCatalogItem(
  item: {
    slug: string;
    id: number;
    nazwa: string;
    cena: number | null;
    typ: "badanie" | "pakiet";
  },
  patientId?: string,
): boolean {
  if (item.cena == null) return false;

  const productKey = catalogCartKey(item.slug);
  return addCartItem({
    key: lineCartKey(productKey, patientId),
    productKey,
    kind: "catalog",
    catalogSlug: item.slug,
    catalogId: item.id,
    name: item.nazwa,
    price: item.cena,
    typ: item.typ,
    patientId,
  });
}

export function addPackageItem(
  item: {
    packageId: string;
    name: string;
    price: number;
  },
  patientId?: string,
): boolean {
  const productKey = packageCartKey(item.packageId);
  return addCartItem({
    key: lineCartKey(productKey, patientId),
    productKey,
    kind: "package",
    packageId: item.packageId,
    name: item.name,
    price: item.price,
    patientId,
  });
}

export function removeCartItem(key: string): void {
  const order = getCart();
  saveOrder({ items: order.items.filter((i) => i.key !== key) });
  notifyCartChange();
}

export function clearCartItems(): void {
  saveOrder({
    items: [],
    orderNumber: undefined,
    slot: undefined,
    location: undefined,
    collectionType: undefined,
    facilityId: undefined,
    homeAddress: undefined,
    homeVisitPersonCount: undefined,
  });
  notifyCartChange();
}

export function notifyCartChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("labflow-cart"));
  }
}

export function startNewOrderAfterSuccess(): void {
  archiveCurrentOrder();
  clearCartItems();
}
