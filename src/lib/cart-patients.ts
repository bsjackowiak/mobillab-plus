import { getOrder, saveOrder } from "./order-storage";
import type { CartItem, OrderState } from "./types";
import { getPatients } from "./patient-storage";

export function cartNeedsAssignment(order: OrderState | null | undefined): boolean {
  if (!order?.items.length) return false;
  if (getPatients().length <= 1) return false;
  return order.items.some((item) => !item.patientId);
}

export function cartAssignmentsComplete(order: OrderState | null | undefined): boolean {
  if (!order?.items.length) return true;
  const patientIds = new Set(getPatients().map((p) => p.id));
  return order.items.every((item) => item.patientId && patientIds.has(item.patientId));
}

export function updateCartItemPatient(itemKey: string, patientId: string): void {
  const order = getOrder();
  if (!order) return;

  saveOrder({
    items: order.items.map((item) =>
      item.key === itemKey ? { ...item, patientId } : item,
    ),
  });
}

export function groupItemsByPatient(
  items: CartItem[],
  patients: { id: string; fullName: string }[],
): { patientId: string; name: string; items: CartItem[] }[] {
  const groups = new Map<string, CartItem[]>();

  for (const patient of patients) {
    groups.set(patient.id, []);
  }

  for (const item of items) {
    const pid = item.patientId ?? patients[0]?.id;
    if (!pid) continue;
    if (!groups.has(pid)) groups.set(pid, []);
    groups.get(pid)!.push(item);
  }

  return patients
    .map((patient) => ({
      patientId: patient.id,
      name: patient.fullName,
      items: groups.get(patient.id) ?? [],
    }))
    .filter((g) => g.items.length > 0);
}
