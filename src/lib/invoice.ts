import type { InvoiceCompanyData, InvoicePersonalData, InvoiceType } from "./types";

export function formatNipInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
}

export function normalizeNip(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidNip(value: string): boolean {
  const digits = normalizeNip(value);
  if (!/^\d{10}$/.test(digits)) return false;

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * weights[i]!;
  }
  const check = sum % 11;
  if (check === 10) return false;
  return check === Number(digits[9]);
}

export function isValidPostalCode(value: string): boolean {
  return /^\d{2}-\d{3}$/.test(value.trim());
}

export function formatPostalCodeInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export type InvoiceFieldErrors = Partial<
  Record<keyof InvoicePersonalData | keyof InvoiceCompanyData, string>
>;

export function validatePersonalInvoice(data: InvoicePersonalData): InvoiceFieldErrors {
  const errors: InvoiceFieldErrors = {};
  if (data.fullName.trim().length < 3) {
    errors.fullName = "Podaj imię i nazwisko na fakturze";
  }
  if (data.address.trim().length < 5) {
    errors.address = "Podaj ulicę i numer";
  }
  if (!isValidPostalCode(data.postalCode)) {
    errors.postalCode = "Kod pocztowy w formacie 00-000";
  }
  if (data.city.trim().length < 2) {
    errors.city = "Podaj miejscowość";
  }
  return errors;
}

export function validateCompanyInvoice(data: InvoiceCompanyData): InvoiceFieldErrors {
  const errors: InvoiceFieldErrors = {};
  if (data.companyName.trim().length < 2) {
    errors.companyName = "Podaj nazwę firmy";
  }
  if (!isValidNip(data.nip)) {
    errors.nip = "Podaj poprawny NIP (10 cyfr)";
  }
  if (data.address.trim().length < 5) {
    errors.address = "Podaj ulicę i numer";
  }
  if (!isValidPostalCode(data.postalCode)) {
    errors.postalCode = "Kod pocztowy w formacie 00-000";
  }
  if (data.city.trim().length < 2) {
    errors.city = "Podaj miejscowość";
  }
  return errors;
}

export function hasBillableInvoice(
  type: InvoiceType | null | undefined,
): type is Extract<InvoiceType, "personal" | "company"> {
  return type === "personal" || type === "company";
}

export function validateInvoice(
  type: InvoiceType | null | undefined,
  personal: InvoicePersonalData,
  company: InvoiceCompanyData,
): InvoiceFieldErrors {
  if (!type || type === "none") return {};
  return type === "personal" ? validatePersonalInvoice(personal) : validateCompanyInvoice(company);
}

export function invoiceSummary(
  type: InvoiceType,
  personal: InvoicePersonalData,
  company: InvoiceCompanyData,
): string {
  if (type === "none") return "";
  if (type === "personal") {
    return `${personal.fullName}, ${personal.address}, ${personal.postalCode} ${personal.city}`;
  }
  return `${company.companyName}, NIP ${formatNipInput(company.nip)}, ${company.address}, ${company.postalCode} ${company.city}`;
}
