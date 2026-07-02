import { getProductKey, lineCartKey, notifyCartChange, normalizeCartItem, UNASSIGNED_PATIENT } from "./cart";
import { MAX_HOME_VISIT_PERSONS } from "./collection";
import { patientShortLabel } from "./patient-onboarding";
import { getOrder, saveOrder } from "./order-storage";
import { getPatients, notifyPatientsChange, patientHasCompleteData } from "./patient-storage";
import { patientHasCompleteIdentity } from "./patient-identity";
import type { CartItem, OrderState, PatientProfile } from "./types";

export type CartAssignmentStatus = {
  complete: boolean;
  unassigned: CartItem[];
  missingPatientData: string[];
};

function orderItems(order: OrderState | null | undefined): CartItem[] {
  if (!order?.items.length) return [];
  return order.items.map(normalizeCartItem);
}

export function getUniquePatientIdsFromCart(order: OrderState | null | undefined): string[] {
  const items = orderItems(order);
  if (!items.length) return [];
  const ids = new Set<string>();
  for (const item of items) {
    if (item.patientId) ids.add(item.patientId);
  }
  return [...ids];
}

export function getOrderPersonCount(order: OrderState | null | undefined = getOrder()): number {
  const fromCart = getUniquePatientIdsFromCart(order).length;
  const declared = order?.homeVisitPersonCount ?? 0;
  const registered = getPatients().filter((patient) => patientHasCompleteData(patient)).length;
  return Math.max(fromCart, declared, registered, 1);
}

export function isMultiPersonOrder(order: OrderState | null | undefined = getOrder()): boolean {
  return getOrderPersonCount(order) >= 2;
}

export function cartNeedsAssignment(order: OrderState | null | undefined): boolean {
  const items = orderItems(order);
  if (!items.length) return false;
  return items.some((item) => !item.patientId);
}

export function cartAssignmentsComplete(order: OrderState | null | undefined): boolean {
  const items = orderItems(order);
  if (!items.length) return true;
  const patientIds = new Set(getPatients().map((p) => p.id));
  return items.every((item) => item.patientId && patientIds.has(item.patientId));
}

export function getCartAssignmentStatus(order: OrderState | null | undefined): CartAssignmentStatus {
  const patients = getPatients();
  const patientMap = new Map(patients.map((p) => [p.id, p]));
  const items = orderItems(order);
  const unassigned = items.filter((item) => !item.patientId);
  const missingPatientData: string[] = [];

  for (const item of items) {
    if (!item.patientId) continue;
    const patient = patientMap.get(item.patientId);
    if (!patient || patient.fullName.trim().length < 3 || !patientHasCompleteIdentity(patient)) {
      if (patient && !missingPatientData.includes(patient.id)) {
        missingPatientData.push(patient.id);
      }
    }
  }

  return {
    complete: cartAssignmentsComplete(order) && unassigned.length === 0 && missingPatientData.length === 0,
    unassigned,
    missingPatientData,
  };
}

export function clearCartAssignmentsForPatient(patientId: string): void {
  const order = getOrder();
  if (!order) return;

  saveOrder({
    items: order.items.map((item) => {
      if (item.patientId !== patientId) return item;
      const productKey = getProductKey(item);
      return {
        ...item,
        productKey,
        patientId: undefined,
        key: lineCartKey(productKey, undefined),
      };
    }),
  });
  notifyCartChange();
}

export function updateCartItemPatient(itemKey: string, patientId: string): boolean {
  const order = getOrder();
  if (!order) return false;

  const item = order.items.find((i) => i.key === itemKey);
  if (!item) return false;

  const productKey = getProductKey(item);
  const newKey = lineCartKey(productKey, patientId);

  if (order.items.some((i) => i.key === newKey && i.key !== itemKey)) {
    return false;
  }

  saveOrder({
    items: order.items.map((i) =>
      i.key === itemKey
        ? { ...i, productKey, patientId, key: newKey }
        : i,
    ),
  });
  notifyCartChange();
  return true;
}

export function removePatientCartLines(patientId: string): void {
  const order = getOrder();
  if (!order) return;

  saveOrder({
    items: order.items.filter((item) => item.patientId !== patientId),
  });
  notifyCartChange();
}

export function syncHomeVisitPersonCount(): void {
  const order = getOrder();
  if (!order) return;

  const cartCount = Math.max(getUniquePatientIdsFromCart(order).length, 1);
  const current = order.homeVisitPersonCount ?? 1;

  if (cartCount > current) {
    saveOrder({ homeVisitPersonCount: cartCount });
  }
}

export function setHomeVisitPersonCount(count: number): number {
  const order = getOrder();
  const cartCount = Math.max(getUniquePatientIdsFromCart(order).length, 1);
  const clamped = Math.min(Math.max(count, 1), MAX_HOME_VISIT_PERSONS);
  const finalCount = Math.max(clamped, cartCount);

  saveOrder({ homeVisitPersonCount: finalCount });
  notifyPatientsChange();
  return finalCount;
}

export type CartPatientGroup = {
  patientId: string;
  name: string;
  items: CartItem[];
  subtotal: number | null;
};

function groupSubtotal(items: CartItem[]): number | null {
  if (items.length === 0) return 0;
  if (items.some((item) => item.price == null)) return null;
  return items.reduce((sum, item) => sum + item.price!, 0);
}

function resolvePatientGroupName(patientId: string, patients: PatientProfile[]): string {
  const knownPatients = patients.length > 0 ? patients : getPatients();
  const index = knownPatients.findIndex((patient) => patient.id === patientId);
  const patient = index >= 0 ? knownPatients[index] : undefined;
  if (!patient) return "Osoba";

  if (patient.fullName.trim().length >= 3) return patient.fullName.trim();
  return patientShortLabel(patient, Math.max(index, 0));
}

export function groupItemsByPatient(
  items: CartItem[],
  patients: PatientProfile[] = [],
): CartPatientGroup[] {
  const groups = new Map<string, CartItem[]>();
  const patientOrder: string[] = [];
  const unassigned: CartItem[] = [];

  for (const item of items) {
    const patientId = item.patientId;
    if (!patientId || patientId === UNASSIGNED_PATIENT) {
      unassigned.push(item);
      continue;
    }

    if (!groups.has(patientId)) {
      groups.set(patientId, []);
      patientOrder.push(patientId);
    }
    groups.get(patientId)!.push(item);
  }

  const result: CartPatientGroup[] = patientOrder.map((patientId) => {
    const groupItems = groups.get(patientId) ?? [];
    return {
      patientId,
      name: resolvePatientGroupName(patientId, patients),
      items: groupItems,
      subtotal: groupSubtotal(groupItems),
    };
  });

  if (unassigned.length > 0) {
    result.push({
      patientId: UNASSIGNED_PATIENT,
      name: "Bez przypisania",
      items: unassigned,
      subtotal: groupSubtotal(unassigned),
    });
  }

  return result;
}
