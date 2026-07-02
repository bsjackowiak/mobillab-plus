import fs from "fs";
import path from "path";
import {
  buildCatalogCategorySections,
  buildFlatCategoryList,
  primaryCategoryLabel,
  type CatalogCategorySection,
  type FlatCategoryEntry,
} from "./catalog-categories";
import { getCatalogTestCount } from "./offer-format";

export type CatalogItem = {
  lp: number;
  id: number;
  nazwa: string;
  slug: string;
  typ: "badanie" | "pakiet";
  kod_elab: string;
  kategorie: string;
  synonimy: string;
  czas_oczekiwania_na_wynik: string;
  przygotowanie: string;
  opis: string;
  sklad_pakietu: string;
  liczba_badan_w_pakiecie: string | number;
  url: string;
  cena_poznan_pln: number | null;
  cena_krakow_pln: number | null;
};

export type CatalogSearchResult = {
  id: number;
  slug: string;
  nazwa: string;
  typ: "badanie" | "pakiet";
  cena: number | null;
  czas: string;
  kategorie: string;
  liczbaBadan: number;
};

type CatalogFile = {
  items: CatalogItem[];
};

type IndexEntry = CatalogSearchResult & {
  nazwaNorm: string;
  synonimyNorm: string;
  kategorieNorm: string;
  opisNorm: string;
};

const CATALOG_PATH = path.join(process.cwd(), "data", "cennik_diag_pelny.json");

let catalogCache: CatalogFile | null = null;
let slugMap: Map<string, CatalogItem> | null = null;
let idMap: Map<number, CatalogItem> | null = null;
let searchIndex: IndexEntry[] | null = null;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadCatalog(): CatalogFile {
  if (catalogCache) return catalogCache;
  const raw = fs.readFileSync(CATALOG_PATH, "utf8");
  catalogCache = JSON.parse(raw) as CatalogFile;
  return catalogCache;
}

export function loadCatalogItems(): CatalogItem[] {
  return loadCatalog().items;
}

function getSlugMap(): Map<string, CatalogItem> {
  if (slugMap) return slugMap;
  const catalog = loadCatalog();
  slugMap = new Map(catalog.items.map((item) => [item.slug, item]));
  return slugMap;
}

function getIdMap(): Map<number, CatalogItem> {
  if (idMap) return idMap;
  const catalog = loadCatalog();
  idMap = new Map(catalog.items.map((item) => [item.id, item]));
  return idMap;
}

function getSearchIndex(): IndexEntry[] {
  if (searchIndex) return searchIndex;

  const catalog = loadCatalog();
  searchIndex = catalog.items.map((item) => ({
    id: item.id,
    slug: item.slug,
    nazwa: item.nazwa,
    typ: item.typ,
    cena: getCatalogPrice(item),
    czas: item.czas_oczekiwania_na_wynik || "—",
    kategorie: item.kategorie || "",
    liczbaBadan: getCatalogTestCount(item),
    nazwaNorm: normalize(item.nazwa),
    synonimyNorm: normalize(item.synonimy || ""),
    kategorieNorm: normalize(item.kategorie || ""),
    opisNorm: normalize((item.opis || "").slice(0, 500)),
  }));

  return searchIndex;
}

export function getCatalogPrice(item: Pick<CatalogItem, "cena_poznan_pln" | "cena_krakow_pln">): number | null {
  return item.cena_poznan_pln ?? item.cena_krakow_pln ?? null;
}

export function getCatalogItemBySlug(slug: string): CatalogItem | undefined {
  return getSlugMap().get(slug);
}

export function getCatalogItemById(id: number): CatalogItem | undefined {
  return getIdMap().get(id);
}

function toCatalogResult(entry: IndexEntry): CatalogSearchResult {
  return {
    id: entry.id,
    slug: entry.slug,
    nazwa: entry.nazwa,
    typ: entry.typ,
    cena: entry.cena,
    czas: entry.czas,
    kategorie: entry.kategorie,
    liczbaBadan: entry.liczbaBadan,
  };
}

function filterCatalog(query: string, typ?: "badanie" | "pakiet"): CatalogSearchResult[] {
  let entries = getSearchIndex();
  if (typ) entries = entries.filter((entry) => entry.typ === typ);

  const q = normalize(query);
  if (q.length < 2) {
    return entries
      .sort((a, b) => a.nazwa.localeCompare(b.nazwa, "pl"))
      .map(toCatalogResult);
  }

  const tokens = q.split(" ").filter((t) => t.length >= 2);
  if (tokens.length === 0) {
    return entries
      .sort((a, b) => a.nazwa.localeCompare(b.nazwa, "pl"))
      .map(toCatalogResult);
  }

  const scored: { entry: IndexEntry; score: number }[] = [];

  for (const entry of entries) {
    let score = 0;
    for (const token of tokens) {
      if (entry.nazwaNorm.includes(token)) score += 12;
      if (entry.synonimyNorm.includes(token)) score += 8;
      if (entry.kategorieNorm.includes(token)) score += 6;
      if (entry.opisNorm.includes(token)) score += 2;
    }
    if (score > 0) {
      if (entry.typ === "pakiet") score += 1;
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.entry.nazwa.localeCompare(b.entry.nazwa, "pl"));
  return scored.map(({ entry }) => toCatalogResult(entry));
}

export function listCatalog({
  query = "",
  typ,
  offset = 0,
  limit = 20,
}: {
  query?: string;
  typ?: "badanie" | "pakiet";
  offset?: number;
  limit?: number;
}): { items: CatalogSearchResult[]; total: number; hasMore: boolean } {
  const all = filterCatalog(query, typ);
  const items = all.slice(offset, offset + limit);
  return {
    items,
    total: all.length,
    hasMore: offset + limit < all.length,
  };
}

export function searchCatalog(query: string, limit = 10): CatalogSearchResult[] {
  return listCatalog({ query, offset: 0, limit }).items;
}

export type { CatalogCategorySection, FlatCategoryEntry };
export { primaryCategoryLabel };

export function getCatalogCategorySections(): CatalogCategorySection[] {
  return buildCatalogCategorySections(loadCatalogItems());
}

export function getFlatCategoryList(): FlatCategoryEntry[] {
  return buildFlatCategoryList(loadCatalogItems());
}

export function getCatalogCategories(limit = 48): string[] {
  return getCatalogCategorySections()
    .slice(0, limit)
    .map((section) => section.name);
}

export type CatalogCategoryGroup = {
  letter: string;
  categories: string[];
};

/** @deprecated Użyj getCatalogCategorySections() */
export function getCatalogCategoriesGrouped(limit = 48): CatalogCategoryGroup[] {
  const categories = getCatalogCategories(limit);
  const byLetter = new Map<string, string[]>();

  for (const category of categories) {
    const letter = category.charAt(0).toLocaleUpperCase("pl") || "#";
    const bucket = byLetter.get(letter) ?? [];
    bucket.push(category);
    byLetter.set(letter, bucket);
  }

  return [...byLetter.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "pl"))
    .map(([letter, items]) => ({ letter, categories: items }));
}

export function toCatalogSummary(item: CatalogItem) {
  return {
    id: item.id,
    slug: item.slug,
    nazwa: item.nazwa,
    typ: item.typ,
    cena: getCatalogPrice(item),
    czas: item.czas_oczekiwania_na_wynik || "—",
    opis: item.opis,
    kategorie: item.kategorie,
    sklad_pakietu: item.sklad_pakietu,
    liczba_badan_w_pakiecie: item.liczba_badan_w_pakiecie,
    przygotowanie: item.przygotowanie,
  };
}

export type CatalogSummary = ReturnType<typeof toCatalogSummary>;
