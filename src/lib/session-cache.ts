import { emptySession, type CompletedOrder, type SessionData } from "@/lib/session-types";
import type { OrderState, PatientProfile } from "@/lib/types";
import { readLegacyBrowserSession } from "@/lib/legacy-browser-session";

let cache: SessionData | null = null;
let hydratedFromServer = false;

function legacyHasData(data: SessionData): boolean {
  return (
    (data.order.items?.length ?? 0) > 0 ||
    data.patients.length > 0 ||
    data.completedOrders.length > 0 ||
    Boolean(data.lastPatientId)
  );
}

function ensureClientCache(): void {
  if (typeof window === "undefined" || cache) return;
  const legacy = readLegacyBrowserSession();
  cache = legacyHasData(legacy) ? legacy : emptySession();
}

export function isSessionHydratedFromServer(): boolean {
  return hydratedFromServer;
}

export function getSessionData(): SessionData {
  ensureClientCache();
  if (!cache) {
    cache = emptySession();
  }
  return cache;
}

export function applySessionData(data: SessionData): void {
  cache = data;
}

export function markSessionHydratedFromServer(): void {
  hydratedFromServer = true;
}

export function touchSession(): void {
  getSessionData().updatedAt = new Date().toISOString();
}

export function getCachedOrder(): OrderState {
  return getSessionData().order;
}

export function setCachedOrder(order: OrderState): void {
  getSessionData().order = order;
  touchSession();
}

export function getCachedPatients(): PatientProfile[] {
  return getSessionData().patients;
}

export function setCachedPatients(patients: PatientProfile[]): void {
  getSessionData().patients = patients;
  touchSession();
}

export function getCachedLastPatientId(): string | null {
  return getSessionData().lastPatientId;
}

export function setCachedLastPatientId(patientId: string | null): void {
  getSessionData().lastPatientId = patientId;
  touchSession();
}

export function getCompletedOrders(): CompletedOrder[] {
  return getSessionData().completedOrders;
}

export function archiveCurrentOrder(): void {
  const order = getCachedOrder();
  if (!order.orderNumber) return;

  const session = getSessionData();
  const archived: CompletedOrder = {
    ...order,
    completedAt: new Date().toISOString(),
  };
  session.completedOrders = [archived, ...session.completedOrders].slice(0, 50);
  touchSession();
}
