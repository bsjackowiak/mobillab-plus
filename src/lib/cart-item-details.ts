import { formatResultTimeValue } from "./offer-format";
import { getPackageById } from "./packages";
import { stripMarkdown } from "./text";
import type { CartItem } from "./types";

export type CartItemDetails = {
  opis?: string;
  zawiera: string[];
  czasWyniku: string;
  przygotowanie?: string;
  wymagaPrzygotowania: boolean;
};

export function getInternalPackageDetails(packageId: string): CartItemDetails | null {
  const pkg = getPackageById(packageId);
  if (!pkg) return null;

  return {
    opis: pkg.why,
    zawiera: pkg.tests,
    czasWyniku: formatResultTimeValue(pkg.resultTime),
    wymagaPrzygotowania: false,
  };
}

export function getCartItemDetails(
  item: CartItem,
  catalogDetailsBySlug: Record<string, CartItemDetails>,
): CartItemDetails | null {
  if (item.kind === "package" && item.packageId) {
    return getInternalPackageDetails(item.packageId);
  }

  if (item.kind === "catalog" && item.catalogSlug) {
    return catalogDetailsBySlug[item.catalogSlug] ?? null;
  }

  return null;
}

export function getCartItemTests(
  item: CartItem,
  catalogDetailsBySlug: Record<string, CartItemDetails>,
): string[] {
  const details = getCartItemDetails(item, catalogDetailsBySlug);
  return details?.zawiera ?? [];
}

export function getCatalogPackageSlugs(items: CartItem[]): string[] {
  return items
    .filter(
      (item) =>
        item.kind === "catalog" &&
        item.typ === "pakiet" &&
        item.catalogSlug,
    )
    .map((item) => item.catalogSlug!);
}

export async function fetchCatalogItemDetails(slugs: string[]): Promise<Record<string, CartItemDetails>> {
  if (slugs.length === 0) return {};

  const res = await fetch("/api/cart-item-details", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slugs }),
  });

  if (!res.ok) throw new Error("details fetch failed");

  const data = (await res.json()) as { details: Record<string, CartItemDetails> };
  return data.details;
}

export function hasPreparation(text: string | undefined): boolean {
  if (!text?.trim()) return false;
  const normalized = text.trim().toLowerCase();
  if (normalized === "brak" || normalized === "nie" || normalized === "nie wymaga") return false;
  return true;
}

export function formatCatalogDetails(item: {
  nazwa: string;
  typ: "badanie" | "pakiet";
  opis?: string;
  sklad_pakietu?: string;
  czas_oczekiwania_na_wynik?: string;
  przygotowanie?: string;
}, zawiera: string[]): CartItemDetails {
  const przygotowanie = item.przygotowanie?.trim();
  const wymaga = hasPreparation(przygotowanie);

  return {
    opis: item.opis ? stripMarkdown(item.opis) : undefined,
    zawiera,
    czasWyniku: formatResultTimeValue(item.czas_oczekiwania_na_wynik || "—"),
    przygotowanie: wymaga ? przygotowanie : undefined,
    wymagaPrzygotowania: wymaga,
  };
}
