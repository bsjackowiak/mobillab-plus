import { patientHasCompleteIdentity } from "./patient-identity";
import type { OrderState, PatientProfile } from "./types";
import { getOrder } from "./order-storage";
import {
  getCachedLastPatientId,
  getCachedPatients,
  setCachedLastPatientId,
  setCachedPatients,
} from "./session-cache";
import { scheduleSessionSync } from "./session-api";

export function createPatientId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function migratePatientProfile(patient: PatientProfile): PatientProfile {
  if (!patient.relation && patientHasCompleteData(patient)) {
    return { ...patient, relation: "self", ageCategory: patient.ageCategory ?? "adult" };
  }
  return patient;
}

function persistPatients(patients: PatientProfile[]): void {
  if (typeof window === "undefined") return;
  setCachedPatients(patients);
  scheduleSessionSync();
  notifyPatientsChange();
}

export function notifyPatientsChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("labflow-patients"));
  }
}

export function getPatients(): PatientProfile[] {
  if (typeof window === "undefined") return [];
  return getCachedPatients().map((p) =>
    migratePatientProfile({ ...p, id: p.id || createPatientId() }),
  );
}

export function savePatients(patients: PatientProfile[]): void {
  persistPatients(patients);
}

export function getPatient(): PatientProfile | null {
  return getPatients()[0] ?? null;
}

export function savePatient(patient: PatientProfile): void {
  savePatients([{ ...patient, id: patient.id || createPatientId() }]);
}

export function getLastSelectedPatientId(): string | null {
  if (typeof window === "undefined") return null;
  return getCachedLastPatientId();
}

export function setLastSelectedPatientId(patientId: string | null): void {
  if (typeof window === "undefined") return;
  setCachedLastPatientId(patientId);
  scheduleSessionSync();
}

export function getDefaultPatientForAdd(): PatientProfile | null {
  const patients = getPatients();
  if (patients.length === 0) return null;
  if (patients.length === 1) return patients[0]!;

  const lastId = getLastSelectedPatientId();
  const last = lastId ? patients.find((p) => p.id === lastId) : undefined;
  return last ?? patients[0]!;
}

export function addPatientSlot(): PatientProfile {
  const patients = getPatients();
  const contact = patients[0];
  const next: PatientProfile = {
    id: createPatientId(),
    fullName: "",
    email: contact?.email ?? "",
    phone: contact?.phone,
    pesel: "",
  };
  savePatients([...patients, next]);
  setLastSelectedPatientId(next.id);
  return next;
}

export function patientHasCompleteData(patient: PatientProfile): boolean {
  return patient.fullName.trim().length >= 3 && patientHasCompleteIdentity(patient);
}

export function patientHasContactData(patient: PatientProfile): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email.trim());
}

export function patientNeedsCheckoutStep(patient: PatientProfile, isContact: boolean): boolean {
  if (!patientHasCompleteData(patient)) return true;
  if (isContact && !patientHasContactData(patient)) return true;
  return false;
}

function getCartPatientIds(order: OrderState | null | undefined): string[] {
  if (!order?.items.length) return [];
  const ids = new Set<string>();
  for (const item of order.items) {
    if (item.patientId) ids.add(item.patientId);
  }
  return [...ids];
}

export function getRequiredPatientCount(order: OrderState | null | undefined): number {
  const cartIds = getCartPatientIds(order);
  const cartCount = cartIds.length;
  const declared = order?.homeVisitPersonCount ?? 1;

  if (order?.collectionType === "home" || declared > 1) {
    return Math.max(declared, cartCount, 1);
  }

  return Math.max(cartCount, 1);
}

export function hasRequiredPatients(order: OrderState | null | undefined): boolean {
  const orderState = order ?? getOrder();
  const patients = getPatients();
  const cartIds = getCartPatientIds(orderState);

  const idsToValidate =
    cartIds.length > 0
      ? cartIds
      : patients.slice(0, getRequiredPatientCount(orderState)).map((p) => p.id);

  if (idsToValidate.length === 0) return false;

  const patientMap = new Map(patients.map((p) => [p.id, p]));
  const identityComplete = idsToValidate.every((id) => {
    const patient = patientMap.get(id);
    return patient && patientHasCompleteData(patient);
  });
  if (!identityComplete) return false;

  const contact = patients[0];
  return Boolean(contact && patientHasContactData(contact));
}

export function hasPatient(): boolean {
  const order = getOrder();
  return hasRequiredPatients(order);
}

export function getContactPatient(): PatientProfile | null {
  return getPatients()[0] ?? null;
}

export function removePatient(patientId: string): PatientProfile[] {
  const updated = getPatients().filter((p) => p.id !== patientId);
  persistPatients(updated);
  return updated;
}

export function clearPatients(): void {
  if (typeof window === "undefined") return;
  setCachedPatients([]);
  setCachedLastPatientId(null);
  scheduleSessionSync();
  notifyPatientsChange();
}
