import { getCartTotal } from "./cart";
import { getFacilityById } from "./locations";
import { getRequiredPatientCount } from "./patient-storage";
import type { CollectionType, OrderState } from "./types";

export const HOME_VISIT_FEE = 79;
export const MAX_HOME_VISIT_PERSONS = 4;

export const TIME_SLOTS = [
  "Jutro, 9:30",
  "Jutro, 11:00",
  "Jutro, 14:30",
  "Pojutrze, 9:00",
] as const;

export function getHomeVisitFee(): number {
  return HOME_VISIT_FEE;
}

export function getCollectionFee(type?: CollectionType): number {
  return type === "home" ? HOME_VISIT_FEE : 0;
}

export function formatCollectionLocation(order: Pick<OrderState, "collectionType" | "facilityId" | "homeAddress">): string {
  if (order.collectionType === "home") {
    return order.homeAddress ? `Pobranie w domu · ${order.homeAddress}` : "Pobranie w domu";
  }
  const facility = order.facilityId ? getFacilityById(order.facilityId) : undefined;
  if (!facility) return "Punkt pobrań";
  return `${facility.name}, ${facility.address}, ${facility.city}`;
}

export function getOrderGrandTotal(order: OrderState): number | null {
  const itemsTotal = getCartTotal();
  if (itemsTotal == null) return null;
  return itemsTotal + getCollectionFee(order.collectionType);
}

export function orderHasCollection(order: OrderState | null | undefined): boolean {
  if (!order?.collectionType) return false;
  if (order.collectionType === "home") {
    return Boolean(order.homeAddress?.trim() && order.slot);
  }
  return Boolean(order.facilityId);
}

export function collectionSummary(order: OrderState): { title: string; detail: string } {
  if (order.collectionType === "home") {
    const persons = order.homeVisitPersonCount ?? 1;
    const personsLabel =
      persons === 1 ? "1 osoba" : persons < 5 ? `${persons} osoby` : `${persons} osób`;

    return {
      title: `${order.slot} · Pobranie w domu`,
      detail: `${order.homeAddress} · ${personsLabel} · +${HOME_VISIT_FEE} zł za dojazd (jedna wizyta)`,
    };
  }
  const facility = order.facilityId ? getFacilityById(order.facilityId) : undefined;
  return {
    title: facility?.name ?? "Punkt pobrań",
    detail: facility
      ? `${facility.address}, ${facility.city} · ${facility.distance} od Ciebie`
      : "",
  };
}

export function homeVisitNeedsMorePatients(order: OrderState | null | undefined): boolean {
  if (order?.collectionType !== "home") return false;
  const required = getRequiredPatientCount(order);
  return required > 1;
}
