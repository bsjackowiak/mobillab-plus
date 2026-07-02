import type { OrderState, PatientProfile, PatientAgeCategory, PatientRelation } from "./types";
import { isValidBirthDate } from "./patient-identity";
import { isValidPesel, parsePeselBirthDate } from "./pesel";

export function birthDateIsoFromPatient(
  patient: Pick<PatientProfile, "pesel" | "birthDate">,
): string | null {
  if (patient.birthDate && isValidBirthDate(patient.birthDate)) {
    return patient.birthDate;
  }
  if (isValidPesel(patient.pesel)) {
    const date = parsePeselBirthDate(patient.pesel);
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return null;
}

export function birthDateFromIso(iso: string): Date | null {
  if (!isValidBirthDate(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function ageInFullYears(birth: Date, at: Date = new Date()): number {
  let years = at.getFullYear() - birth.getFullYear();
  const monthDiff = at.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < birth.getDate())) {
    years -= 1;
  }
  return years;
}

export function inferAgeCategoryFromBirth(birth: Date): PatientAgeCategory {
  const years = ageInFullYears(birth);
  if (years < 4) return "child_u4";
  if (years < 18) return "child_4_12";
  return "adult";
}

export function peselMatchesBirthDate(pesel: string, birthDateIso: string): boolean {
  if (!isValidPesel(pesel) || !isValidBirthDate(birthDateIso)) return false;
  const fromPesel = parsePeselBirthDate(pesel);
  const fromInput = birthDateFromIso(birthDateIso);
  if (!fromPesel || !fromInput) return false;
  return (
    fromPesel.getFullYear() === fromInput.getFullYear() &&
    fromPesel.getMonth() === fromInput.getMonth() &&
    fromPesel.getDate() === fromInput.getDate()
  );
}

export function validateAgeCategoryConsistency(
  birthDateIso: string,
  ageCategory?: PatientAgeCategory,
  relation?: PatientRelation,
): string | null {
  const birth = birthDateFromIso(birthDateIso);
  if (!birth) return null;

  const inferred = inferAgeCategoryFromBirth(birth);
  const years = ageInFullYears(birth);

  if (relation === "self" && years < 18) {
    return "Osoba zamawiająca musi mieć ukończone 18 lat";
  }

  if (!ageCategory) return null;

  if (ageCategory === "adult" && years < 18) {
    return "Wiek nie zgadza się z kategorią „dorosły”";
  }
  if (ageCategory === "child_u4" && years >= 4) {
    return "Wiek nie zgadza się z kategorią „dziecko do 4 lat”";
  }
  if (ageCategory === "child_4_12" && (years < 4 || years >= 18)) {
    return "Wiek nie zgadza się z kategorią „dziecko 4–12 lat”";
  }

  return null;
}

export function validateIdentityAgeRules(input: {
  pesel?: string;
  birthDate?: string;
  identityMode: "pesel" | "birthDate";
  ageCategory?: PatientAgeCategory;
  relation?: PatientRelation;
}): string | null {
  if (input.identityMode === "pesel" && isValidPesel(input.pesel ?? "")) {
    const peselBirth = parsePeselBirthDate(input.pesel!);
    if (!peselBirth) return "Nie można odczytać daty urodzenia z PESEL";

    if (input.birthDate && isValidBirthDate(input.birthDate)) {
      if (!peselMatchesBirthDate(input.pesel!, input.birthDate)) {
        return "PESEL nie zgadza się z datą urodzenia";
      }
    }

    const iso = birthDateIsoFromPatient({ pesel: input.pesel!, birthDate: input.birthDate });
    if (iso) {
      return validateAgeCategoryConsistency(iso, input.ageCategory, input.relation);
    }
    return null;
  }

  if (input.identityMode === "birthDate" && isValidBirthDate(input.birthDate ?? "")) {
    return validateAgeCategoryConsistency(
      input.birthDate!,
      input.ageCategory,
      input.relation,
    );
  }

  return null;
}
