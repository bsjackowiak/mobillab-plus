import {
  getCatalogItemBySlug,
  getCatalogPrice,
  listCatalog,
  type CatalogSearchResult,
} from "./catalog";
import { getCatalogTestCount } from "./offer-format";
import { RECOMMENDED_BADANIA_SLUGS } from "./recommended-home";

export type RecommendedListItem = {
  id: number;
  slug: string;
  nazwa: string;
  typ: "badanie" | "pakiet";
  cena: number | null;
  czas: string;
  liczbaBadan: number;
};

function fromCatalogResult(item: CatalogSearchResult): RecommendedListItem {
  return {
    id: item.id,
    slug: item.slug,
    nazwa: item.nazwa,
    typ: item.typ,
    cena: item.cena,
    czas: item.czas,
    liczbaBadan: item.liczbaBadan,
  };
}

function fromCatalogSlug(slug: string): RecommendedListItem | null {
  const item = getCatalogItemBySlug(slug);
  if (!item) return null;

  return {
    id: item.id,
    slug: item.slug,
    nazwa: item.nazwa,
    typ: item.typ,
    cena: getCatalogPrice(item),
    czas: item.czas_oczekiwania_na_wynik || "—",
    liczbaBadan: getCatalogTestCount(item),
  };
}

let cachedBadaniaList: RecommendedListItem[] | null = null;

function getAllRecommendedBadania(): RecommendedListItem[] {
  if (cachedBadaniaList) return cachedBadaniaList;

  const curated = RECOMMENDED_BADANIA_SLUGS.flatMap((slug) => {
    const item = fromCatalogSlug(slug);
    return item && item.typ === "badanie" ? [item] : [];
  });

  const curatedSlugs = new Set(curated.map((item) => item.slug));
  const rest = listCatalog({ typ: "badanie", limit: 10_000 }).items
    .filter((item) => !curatedSlugs.has(item.slug))
    .map(fromCatalogResult);

  cachedBadaniaList = [...curated, ...rest];
  return cachedBadaniaList;
}

export function listRecommendedBadania(
  offset: number,
  limit: number,
): { items: RecommendedListItem[]; total: number; hasMore: boolean } {
  const all = getAllRecommendedBadania();
  const items = all.slice(offset, offset + limit);
  return {
    items,
    total: all.length,
    hasMore: offset + limit < all.length,
  };
}

export function listRecommendedPakiety(
  offset: number,
  limit: number,
): { items: RecommendedListItem[]; total: number; hasMore: boolean } {
  const result = listCatalog({ typ: "pakiet", offset, limit });
  return {
    items: result.items.map(fromCatalogResult),
    total: result.total,
    hasMore: result.hasMore,
  };
}
