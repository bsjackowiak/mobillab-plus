import type { InvoiceCompanyData } from "./types";
import { fetchCompanyByNipFromRegon } from "./regon-lookup";

export type NipLookupResult = Pick<
  InvoiceCompanyData,
  "companyName" | "address" | "postalCode" | "city"
> & {
  source?: "regon" | "vat" | "ceidg";
};

type MfVatSubject = {
  name?: string;
  workingAddress?: string | null;
  residenceAddress?: string | null;
};

type MfVatResponse = {
  result?: {
    subject?: MfVatSubject | null;
  };
  code?: string;
  message?: string;
};

type CeidgAddress = {
  ulica?: string | null;
  budynek?: string | null;
  lokal?: string | null;
  kod?: string | null;
  miasto?: string | null;
};

type CeidgCompany = {
  nazwa?: string | null;
  adresDzialalnosci?: CeidgAddress | null;
  adresDzialanosci?: CeidgAddress | null;
};

type CeidgFirmaResponse = {
  firma?: CeidgCompany | null;
  firmy?: CeidgCompany[] | null;
};

export function parsePolishRegistryAddress(raw: string): Omit<NipLookupResult, "companyName" | "source"> | null {
  const trimmed = raw.trim();

  const commaMatch = trimmed.match(/^(.+?),\s*(\d{2}-\d{3})\s+(.+)$/);
  if (commaMatch) {
    return {
      address: commaMatch[1]!.trim(),
      postalCode: commaMatch[2]!,
      city: commaMatch[3]!.trim(),
    };
  }

  const spaceMatch = trimmed.match(/^(.+?)\s+(\d{2}-\d{3})\s+(.+)$/);
  if (!spaceMatch) return null;

  let address = spaceMatch[1]!.trim();
  address = address.replace(/^ul\/\s*/i, "ul. ");

  return {
    address,
    postalCode: spaceMatch[2]!,
    city: spaceMatch[3]!.trim(),
  };
}

function formatCeidgStreet(address?: CeidgAddress | null): string {
  if (!address) return "";
  const parts = [address.ulica?.trim(), address.budynek?.trim(), address.lokal?.trim()].filter(Boolean);
  return parts.join(" ").trim();
}

export function mapMfVatSubjectToCompany(subject: MfVatSubject): NipLookupResult | null {
  const companyName = subject.name?.trim();
  if (!companyName) return null;

  const rawAddress = subject.workingAddress?.trim() || subject.residenceAddress?.trim() || "";
  const parsed = rawAddress ? parsePolishRegistryAddress(rawAddress) : null;

  return {
    companyName,
    address: parsed?.address ?? rawAddress,
    postalCode: parsed?.postalCode ?? "",
    city: parsed?.city ?? "",
    source: "vat",
  };
}

export function mapCeidgCompanyToInvoice(company: CeidgCompany): NipLookupResult | null {
  const companyName = company.nazwa?.trim();
  if (!companyName) return null;

  const addressData = company.adresDzialalnosci ?? company.adresDzialanosci;
  const street = formatCeidgStreet(addressData);

  return {
    companyName,
    address: street,
    postalCode: addressData?.kod?.trim() ?? "",
    city: addressData?.miasto?.trim() ?? "",
    source: "ceidg",
  };
}

function completenessScore(result: NipLookupResult): number {
  let score = 0;
  if (result.companyName.trim().length >= 2) score += 3;
  if (result.address.trim().length >= 5) score += 3;
  if (result.postalCode.trim()) score += 2;
  if (result.city.trim().length >= 2) score += 2;
  return score;
}

function mergeNipResults(primary: NipLookupResult, secondary: NipLookupResult): NipLookupResult {
  const pick = (a: string, b: string) => (a.trim().length >= b.trim().length ? a : b);
  const source =
    completenessScore(primary) >= completenessScore(secondary) ? primary.source : secondary.source;

  return {
    companyName: pick(primary.companyName, secondary.companyName),
    address: pick(primary.address, secondary.address),
    postalCode: primary.postalCode.trim() ? primary.postalCode : secondary.postalCode,
    city: primary.city.trim() ? primary.city : secondary.city,
    source,
  };
}

function pickBestNipLookupResult(results: Array<NipLookupResult | null>): NipLookupResult | null {
  const candidates = results.filter((result): result is NipLookupResult => result != null);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0]!;

  return candidates.reduce((best, current) =>
    completenessScore(current) > completenessScore(best) ? current : best,
  );
}

async function settleLookup(
  promise: Promise<NipLookupResult | null>,
): Promise<NipLookupResult | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

export async function fetchCompanyByNip(
  nip: string,
  options?: { regonApiKey?: string | null; ceidgToken?: string | null },
): Promise<NipLookupResult | null> {
  const regonKey = options?.regonApiKey?.trim();

  const [fromMf, fromRegon] = await Promise.all([
    settleLookup(fetchCompanyByNipFromMf(nip)),
    regonKey ? settleLookup(fetchCompanyByNipFromRegon(nip, regonKey)) : Promise.resolve(null),
  ]);

  let result: NipLookupResult | null = null;
  if (fromMf && fromRegon) {
    result = mergeNipResults(fromMf, fromRegon);
  } else {
    result = pickBestNipLookupResult([fromMf, fromRegon]);
  }

  if (result) return result;

  const token = options?.ceidgToken?.trim();
  if (!token) return null;

  return settleLookup(fetchCompanyByNipFromCeidg(nip, token));
}

export async function fetchCompanyByNipFromMf(nip: string): Promise<NipLookupResult | null> {
  const date = new Date().toISOString().slice(0, 10);
  const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${date}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const payload = (await response.json()) as MfVatResponse;

    if (!response.ok) {
      if (payload.code === "WL-113" || payload.code === "WL-100") {
        return null;
      }
      throw new Error(payload.message ?? "Błąd rejestru VAT");
    }

    const subject = payload.result?.subject;
    if (!subject) return null;

    return mapMfVatSubjectToCompany(subject);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCompanyByNipFromCeidg(
  nip: string,
  token: string,
): Promise<NipLookupResult | null> {
  const url = `https://dane.biznes.gov.pl/api/ceidg/v3/firma?nip=${encodeURIComponent(nip)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error("Błąd API CEIDG");
    }

    const payload = (await response.json()) as CeidgFirmaResponse;
    const company = payload.firma ?? payload.firmy?.[0];
    if (!company) return null;

    return mapCeidgCompanyToInvoice(company);
  } finally {
    clearTimeout(timeout);
  }
}
