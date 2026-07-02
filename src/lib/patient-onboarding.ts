import {
  createPatientId,
  getPatients,
  notifyPatientsChange,
  patientHasCompleteData,
  savePatients,
  setLastSelectedPatientId,
} from "./patient-storage";
import { isValidBirthDate, patientIdentityMode } from "./patient-identity";
import { isValidPesel } from "./pesel";
import type { PatientAgeCategory, PatientOnboardingInput, PatientProfile, PatientRelation } from "./types";
import { validateIdentityAgeRules } from "./patient-age";

export type PatientIdentityFields = {
  pesel?: string;
  birthDate?: string;
  identityMode: "pesel" | "birthDate";
  ageCategory?: PatientAgeCategory;
  relation?: PatientRelation;
};

export function validatePatientContact(email: string, consent: boolean): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Podaj poprawny adres e-mail";
  }
  if (!consent) return "Wymagana zgoda na przetwarzanie danych";
  return null;
}

export function validatePatientIdentity(
  firstName: string,
  lastName: string,
  identity: PatientIdentityFields,
): string | null {
  if (firstName.trim().length < 2) return "Podaj imię";
  if (lastName.trim().length < 2) return "Podaj nazwisko";
  if (`${firstName.trim()} ${lastName.trim()}`.length < 3) return "Podaj imię i nazwisko";

  if (identity.identityMode === "birthDate") {
    if (!isValidBirthDate(identity.birthDate ?? "")) return "Podaj datę urodzenia";
    const ageError = validateIdentityAgeRules({
      birthDate: identity.birthDate,
      identityMode: "birthDate",
      ageCategory: identity.ageCategory,
      relation: identity.relation,
    });
    if (ageError) return ageError;
    return null;
  }

  if (!isValidPesel(identity.pesel ?? "")) return "Nieprawidłowy numer PESEL";

  const ageError = validateIdentityAgeRules({
    pesel: identity.pesel,
    birthDate: identity.birthDate,
    identityMode: "pesel",
    ageCategory: identity.ageCategory,
    relation: identity.relation,
  });
  if (ageError) return ageError;
  return null;
}

function identityFromInput(input: Pick<PatientOnboardingInput, "pesel" | "birthDate">): {
  pesel: string;
  birthDate?: string;
} {
  if (input.birthDate && isValidBirthDate(input.birthDate) && !isValidPesel(input.pesel)) {
    return { pesel: "", birthDate: input.birthDate };
  }
  return { pesel: input.pesel, birthDate: undefined };
}

export function buildFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`;
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export function parseFullNameInput(fullName: string): { firstName: string; lastName: string } {
  return splitFullName(fullName);
}

export function ageCategoryForRelation(
  relation: PatientRelation,
  childAge?: PatientAgeCategory,
): PatientAgeCategory {
  if (relation === "child") return childAge ?? "child_4_12";
  return "adult";
}

export function needsFirstPatientSetup(): boolean {
  const patients = getPatients();
  if (patients.length === 0) return true;

  const hasCompleteProfile = patients.some(
    (patient) => Boolean(patient.relation) && patientHasCompleteData(patient),
  );
  if (hasCompleteProfile) return false;

  const contact = patients[0]!;
  return !contact.relation || !patientHasCompleteData(contact);
}

export function createPatientFromOnboarding(input: PatientOnboardingInput): PatientProfile {
  const fullName = buildFullName(input.firstName, input.lastName);
  const patients = getPatients();
  const identity = identityFromInput(input);

  if (patients.length === 0) {
    const patient: PatientProfile = {
      id: createPatientId(),
      fullName,
      email: input.email?.trim().toLowerCase() ?? "",
      phone: input.phone?.trim() || undefined,
      pesel: identity.pesel,
      birthDate: identity.birthDate,
      relation: input.relation,
      ageCategory: input.ageCategory,
    };
    savePatients([patient]);
    setLastSelectedPatientId(patient.id);
    return patient;
  }

  const contact = patients[0]!;
  const updated: PatientProfile = {
    ...contact,
    fullName,
    email: input.email?.trim().toLowerCase() ?? contact.email,
    phone: input.phone?.trim() || contact.phone,
    pesel: identity.pesel,
    birthDate: identity.birthDate,
    relation: input.relation,
    ageCategory: input.ageCategory,
  };
  savePatients([updated, ...patients.slice(1)]);
  setLastSelectedPatientId(updated.id);
  notifyPatientsChange();
  return updated;
}

export function createAdditionalPatient(
  input: Pick<PatientOnboardingInput, "firstName" | "lastName" | "pesel" | "birthDate">,
): PatientProfile {
  const contact = getPatients()[0];
  const identity = identityFromInput(input);
  const patient: PatientProfile = {
    id: createPatientId(),
    fullName: buildFullName(input.firstName, input.lastName),
    email: contact?.email ?? "",
    phone: contact?.phone,
    pesel: identity.pesel,
    birthDate: identity.birthDate,
    relation: "other",
    ageCategory: "adult",
  };
  savePatients([...getPatients(), patient]);
  setLastSelectedPatientId(patient.id);
  notifyPatientsChange();
  return patient;
}

export function updatePatientProfile(
  patientId: string,
  input: Pick<PatientOnboardingInput, "firstName" | "lastName" | "pesel" | "birthDate">,
): PatientProfile | null {
  const patients = getPatients();
  const index = patients.findIndex((patient) => patient.id === patientId);
  if (index < 0) return null;

  const identity = identityFromInput(input);
  const updated: PatientProfile = {
    ...patients[index]!,
    fullName: buildFullName(input.firstName, input.lastName),
    pesel: identity.pesel,
    birthDate: identity.birthDate,
  };

  const next = [...patients];
  next[index] = updated;
  savePatients(next);
  notifyPatientsChange();
  return updated;
}

export function patientShortLabel(
  patient: Pick<PatientProfile, "fullName" | "relation">,
  index: number,
): string {
  const name = patient.fullName.trim();
  if (name.length >= 2) return name.split(" ")[0] ?? name;
  if (patient.relation === "self") return "Ja";
  if (patient.relation === "child") return "Dziecko";
  if (patient.relation === "other") return "Inna osoba";
  return index === 0 ? "Kontakt" : `Osoba ${index + 1}`;
}
