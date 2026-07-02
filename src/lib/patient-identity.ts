import { isValidPesel, maskPesel } from "./pesel";
import type { PatientProfile } from "./types";

export type PatientIdentityMode = "pesel" | "birthDate";

export function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return false;
  if (year < today.getFullYear() - 120) return false;

  return true;
}

export function formatBirthDateDisplay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

export function patientIdentityMode(
  patient: Pick<PatientProfile, "pesel" | "birthDate">,
): PatientIdentityMode {
  if (isValidPesel(patient.pesel)) return "pesel";
  if (patient.birthDate && isValidBirthDate(patient.birthDate)) return "birthDate";
  return "pesel";
}

export function patientHasCompleteIdentity(
  patient: Pick<PatientProfile, "pesel" | "birthDate">,
): boolean {
  return isValidPesel(patient.pesel) || isValidBirthDate(patient.birthDate ?? "");
}

export function formatPatientIdentityMeta(
  patient: Pick<PatientProfile, "pesel" | "birthDate">,
): string {
  if (isValidPesel(patient.pesel)) return `PESEL ${maskPesel(patient.pesel)}`;
  if (patient.birthDate && isValidBirthDate(patient.birthDate)) {
    return `ur. ${formatBirthDateDisplay(patient.birthDate)}`;
  }
  return "uzupełnij dane";
}

export function formatPatientIdentitySaved(
  patient: Pick<PatientProfile, "pesel" | "birthDate">,
): string {
  if (isValidPesel(patient.pesel)) return "PESEL zapisany";
  if (patient.birthDate && isValidBirthDate(patient.birthDate)) {
    return `Data urodzenia: ${formatBirthDateDisplay(patient.birthDate)}`;
  }
  return "Dane zapisane";
}
