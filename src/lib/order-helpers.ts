import type { OrderState } from "./types";
import { getOrder } from "./order-storage";

export function orderHasItem(order: OrderState | null | undefined): boolean {
  const items = order?.items ?? getOrder()?.items ?? [];
  return items.length > 0;
}
