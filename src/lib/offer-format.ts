import type { CatalogItem } from "./catalog";

export function getCatalogTestCount(
  item: Pick<CatalogItem, "typ" | "sklad_pakietu"> & {
    liczba_badan_w_pakiecie?: string | number;
  },
): number {
  if (item.typ === "badanie") return 1;

  const fromField = Number(item.liczba_badan_w_pakiecie);
  if (Number.isFinite(fromField) && fromField > 0) return fromField;

  return parsePackageComposition(item.sklad_pakietu).length;
}

export function parsePackageComposition(sklad: string): string[] {
  const clean = sklad.trim();
  if (!clean) return [];

  return clean
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function formatTestCount(count: number): string {
  if (count === 1) return "1 badanie";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} badania`;
  }
  return `${count} badań`;
}

export function normalizeResultTime(czas: string): string {
  const clean = czas.trim();
  if (!clean || clean === "—") return clean;

  if (/^jutro\b/i.test(clean)) return "1 dzień";

  return clean;
}

export function formatResultTime(czas: string): string {
  const clean = normalizeResultTime(czas);
  if (!clean || clean === "—") return "Wynik: do ustalenia";
  return `Wynik: ${clean}`;
}

export function formatResultTimeValue(czas: string): string {
  const clean = normalizeResultTime(czas);
  if (!clean || clean === "—") return "do ustalenia";
  return clean;
}
