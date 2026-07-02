import { notifyCartChange } from "./cart";
import { removePatientCartLines, syncHomeVisitPersonCount } from "./cart-patients";
import { getOrder } from "./order-storage";
import {
  getLastSelectedPatientId,
  getPatients,
  getRequiredPatientCount,
  removePatient,
  setLastSelectedPatientId,
} from "./patient-storage";
import type { PatientProfile } from "./types";

export function canRemovePatientByIndex(
  index: number,
  patientCount: number,
  requiredCount: number,
): boolean {
  if (patientCount === 0) return false;
  if (requiredCount === 1) return true;
  return index > 0;
}

export function canRemovePatientById(patientId: string): boolean {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === patientId);
  if (index < 0) return false;

  const order = getOrder();
  return canRemovePatientByIndex(index, patients.length, getRequiredPatientCount(order));
}

export function removePatientFully(patientId: string): PatientProfile[] {
  if (!canRemovePatientById(patientId)) {
    return getPatients();
  }

  removePatientCartLines(patientId);
  const updated = removePatient(patientId);

  if (getLastSelectedPatientId() === patientId) {
    if (updated[0]) setLastSelectedPatientId(updated[0].id);
    else setLastSelectedPatientId(null);
  }

  syncHomeVisitPersonCount();
  notifyCartChange();
  return updated;
}
