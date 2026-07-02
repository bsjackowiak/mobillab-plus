import { BRAND } from "./brand";

/** Dane administratora — uzupełnij przed produkcją (KRS, NIP). */
export const COMPANY = {
  brandName: BRAND.name,
  legalName: "Mobillab+ Sp. z o.o.",
  nip: "7792853399",
  krs: "0001123456",
  regon: "527285339",
  address: "ul. Grunwaldzka 182",
  postalCode: "60-166",
  city: "Poznań",
  country: "Polska",
  contactEmail: "kontakt@mobillab.pl",
  privacyEmail: "iod@mobillab.pl",
  phone: "+48 61 000 00 00",
  uodoUrl: "https://uodo.gov.pl",
  uodoName: "Urząd Ochrony Danych Osobowych",
} as const;

export function companyAddressLine(): string {
  return `${COMPANY.address}, ${COMPANY.postalCode} ${COMPANY.city}`;
}

export function companyRegistryLine(): string {
  return `KRS ${COMPANY.krs} · NIP ${COMPANY.nip} · REGON ${COMPANY.regon}`;
}
