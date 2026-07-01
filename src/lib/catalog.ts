import fs from "fs";
import path from "path";

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
  liczba_badan_w_pakiecie: string;
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

function getSlugMap(): Map<string, CatalogItem> {
  if (slugMap) return slugMap;
  const catalog = loadCatalog();
  slugMap = new Map(catalog.items.map((item) => [item.slug, item]));
  return slugMap;
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

export function searchCatalog(query: string, limit = 10): CatalogSearchResult[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const tokens = q.split(" ").filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];

  const scored: { entry: IndexEntry; score: number }[] = [];

  for (const entry of getSearchIndex()) {
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

  return scored.slice(0, limit).map(({ entry }) => ({
    id: entry.id,
    slug: entry.slug,
    nazwa: entry.nazwa,
    typ: entry.typ,
    cena: entry.cena,
    czas: entry.czas,
    kategorie: entry.kategorie,
  }));
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
