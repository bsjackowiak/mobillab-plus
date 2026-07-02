import Bir from "bir1";
import { modern } from "bir1/normalize";
import type { NipLookupResult } from "./nip-lookup";

type RegonSearchRow = {
  Regon?: string;
  Nazwa?: string;
  KodPocztowy?: string;
  Miejscowosc?: string;
  Ulica?: string;
  NrNieruchomosci?: string;
  NrLokalu?: string;
  Typ?: string;
  SilosID?: string;
};

type RegonReportRow = {
  nazwa?: string;
  adSiedzUlicaNazwa?: string;
  adSiedzNumerNieruchomosci?: string;
  adSiedzNumerLokalu?: string;
  adSiedzKodPocztowy?: string;
  adSiedzMiejscowoscNazwa?: string;
};

function formatRegonPostalCode(code: string): string {
  const digits = code.replace(/\D/g, "");
  if (digits.length === 5) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return code.trim();
}

function formatStreet(parts: Array<string | undefined>): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(" ").trim();
}

export function mapRegonSearchRow(row: RegonSearchRow): NipLookupResult | null {
  const companyName = row.Nazwa?.trim();
  if (!companyName) return null;

  return {
    companyName,
    address: formatStreet([row.Ulica, row.NrNieruchomosci, row.NrLokalu]),
    postalCode: formatRegonPostalCode(row.KodPocztowy?.trim() ?? ""),
    city: row.Miejscowosc?.trim() ?? "",
    source: "regon",
  };
}

function pickReportType(row: RegonSearchRow): "BIR11OsPrawna" | "BIR11OsFizycznaDzialalnoscCeidg" | "BIR11OsFizycznaDzialalnoscPozostala" {
  if (row.Typ === "F") {
    return row.SilosID === "1" ? "BIR11OsFizycznaDzialalnoscCeidg" : "BIR11OsFizycznaDzialalnoscPozostala";
  }
  return "BIR11OsPrawna";
}

function mapRegonReport(report: RegonReportRow, fallback: NipLookupResult): NipLookupResult {
  const companyName = report.nazwa?.trim() || fallback.companyName;
  const address = formatStreet([
    report.adSiedzUlicaNazwa,
    report.adSiedzNumerNieruchomosci,
    report.adSiedzNumerLokalu,
  ]);
  const postalCode = report.adSiedzKodPocztowy
    ? formatRegonPostalCode(report.adSiedzKodPocztowy)
    : fallback.postalCode;
  const city = report.adSiedzMiejscowoscNazwa?.trim() || fallback.city;

  return {
    companyName,
    address: address || fallback.address,
    postalCode: postalCode || fallback.postalCode,
    city: city || fallback.city,
    source: "regon",
  };
}

function needsReportEnrichment(result: NipLookupResult): boolean {
  return result.address.length < 3 || !result.postalCode || !result.city;
}

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /no data found|nie znaleziono wpisu/i.test(error.message)
  );
}

export async function fetchCompanyByNipFromRegon(
  nip: string,
  apiKey?: string | null,
): Promise<NipLookupResult | null> {
  const key = apiKey?.trim();
  const searchClient = new Bir(key ? { key } : undefined);

  let row: RegonSearchRow;
  try {
    row = (await searchClient.search({ nip })) as RegonSearchRow;
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }

  const mapped = mapRegonSearchRow(row);
  if (!mapped) return null;

  if (!needsReportEnrichment(mapped) || !row.Regon) {
    return mapped;
  }

  const reportClient = new Bir({
    ...(key ? { key } : {}),
    normalizeFn: modern,
  });

  try {
    const report = (await reportClient.report({
      regon: row.Regon,
      report: pickReportType(row),
    })) as RegonReportRow;
    return mapRegonReport(report, mapped);
  } catch {
    return mapped;
  }
}
