import type { CartItem, OrderState } from "./types";
import { getOrder, saveOrder } from "./order-storage";

export function getCart(): OrderState {
  return getOrder() ?? { items: [] };
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

export function addCartItem(item: CartItem): boolean {
  const order = getCart();
  if (order.items.some((i) => i.key === item.key)) {
    return false;
  }
  saveOrder({ items: [...order.items, item] });
  notifyCartChange();
  return true;
}

export function isInCart(key: string): boolean {
  return getCartItems().some((i) => i.key === key);
}

export function catalogCartKey(slug: string): string {
  return `catalog:${slug}`;
}

export function addCatalogItem(item: {
  slug: string;
  id: number;
  nazwa: string;
  cena: number | null;
  typ: "badanie" | "pakiet";
}): boolean {
  if (item.cena == null) return false;

  return addCartItem({
    key: catalogCartKey(item.slug),
    kind: "catalog",
    catalogSlug: item.slug,
    catalogId: item.id,
    name: item.nazwa,
    price: item.cena,
    typ: item.typ,
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
  clearCartItems();
}
