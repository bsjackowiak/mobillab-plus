import type { OrderState, PatientProfile } from "./types";
import { getOrder } from "./order-storage";

const PATIENTS_KEY = "mobillab-patients";
const LEGACY_PATIENT_KEY = "labflow-patient";

export function createPatientId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function persistPatients(patients: PatientProfile[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function getPatients(): PatientProfile[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(PATIENTS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PatientProfile[];
      return parsed.map((p) => ({ ...p, id: p.id || createPatientId() }));
    } catch {
      return [];
    }
  }

  const legacy = localStorage.getItem(LEGACY_PATIENT_KEY);
  if (!legacy) return [];

  try {
    const patient = JSON.parse(legacy) as PatientProfile;
    const withId: PatientProfile = {
      ...patient,
      id: patient.id || createPatientId(),
    };
    persistPatients([withId]);
    return [withId];
  } catch {
    return [];
  }
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

export function getRequiredPatientCount(order: OrderState | null | undefined): number {
  if (order?.collectionType === "home" && order.homeVisitPersonCount) {
    return order.homeVisitPersonCount;
  }
  return 1;
}

export function hasRequiredPatients(order: OrderState | null | undefined): boolean {
  const required = getRequiredPatientCount(order);
  const patients = getPatients();
  if (patients.length < required) return false;

  return patients.slice(0, required).every((p) => p.fullName.trim().length >= 3 && p.pesel.length === 11);
}

export function hasPatient(): boolean {
  const order = getOrder();
  return hasRequiredPatients(order);
}

export function getContactPatient(): PatientProfile | null {
  return getPatients()[0] ?? null;
}

export function clearPatients(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PATIENTS_KEY);
  localStorage.removeItem(LEGACY_PATIENT_KEY);
}
