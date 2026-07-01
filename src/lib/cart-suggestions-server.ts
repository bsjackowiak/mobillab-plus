import { getCatalogItemBySlug, searchCatalog } from "./catalog";
import { getPackageById } from "./packages";
import type { CartItem } from "./types";
import type { CartSuggestion } from "./cart-suggestion-types";

const PACKAGE_RELATIONS: Record<string, { packageId: string; reason: string }[]> = {
  thyroid: [
    { packageId: "vitamin-d", reason: "Często sprawdzane razem przy zmęczeniu" },
    { packageId: "control", reason: "Szerszy przegląd zdrowia" },
  ],
  cholesterol: [
    { packageId: "control", reason: "Uzupełnij coroczną kontrolę" },
    { packageId: "thyroid", reason: "Tarczyca wpływa na metabolizm lipidów" },
  ],
  control: [
    { packageId: "vitamin-d", reason: "Wit. D nie jest w pakiecie kontrolnym" },
    { packageId: "cholesterol", reason: "Pełniejszy profil lipidowy" },
  ],
  "vitamin-d": [
    { packageId: "thyroid", reason: "Zmęczenie — warto sprawdzić tarczycę" },
    { packageId: "control", reason: "Rozszerz profilaktykę" },
  ],
  weight: [
    { packageId: "thyroid", reason: "Uzupełnij diagnostykę hormonalną" },
    { packageId: "cholesterol", reason: "Metabolizm i lipidy idą w parze" },
  ],
};

const CATALOG_SEARCH_HINTS: { match: RegExp; queries: { q: string; reason: string }[] }[] = [
  {
    match: /tsh|tarczyc|ft4|ft3|hormon/i,
    queries: [
      { q: "witamina d", reason: "Często dobierane przy problemach z tarczycą" },
      { q: "morfologia", reason: "Podstawowa kontrola przy zmęczeniu" },
    ],
  },
  {
    match: /cholesterol|ldl|hdl|trigliceryd|lipid/i,
    queries: [
      { q: "glukoza", reason: "Metabolizm glukozy i lipidów — razem" },
      { q: "tsh", reason: "Tarczyca wpływa na poziom cholesterolu" },
    ],
  },
  {
    match: /glukoz|insulin|homa|cukr|diabet/i,
    queries: [
      { q: "cholesterol", reason: "Profil metaboliczny — kolejny krok" },
      { q: "morfologia", reason: "Kontrola ogólnego stanu zdrowia" },
    ],
  },
  {
    match: /witamin|ferrytyn|żelaz|b12|fol/i,
    queries: [
      { q: "morfologia", reason: "Ocena niedoborów i ogólnego stanu" },
      { q: "tsh", reason: "Zmęczenie — sprawdź też tarczycę" },
    ],
  },
  {
    match: /morfolog|krw|ob\b|rozmaz/i,
    queries: [
      { q: "ferrytyna", reason: "Często uzupełniane po morfologii" },
      { q: "witamina d", reason: "Popularne badanie profilaktyczne" },
    ],
  },
];

function cartKeys(items: CartItem[]): Set<string> {
  return new Set(items.map((i) => i.key));
}

function packageToSuggestion(
  packageId: string,
  reason: string,
  inCart: Set<string>,
): CartSuggestion | null {
  const key = `package:${packageId}`;
  if (inCart.has(key)) return null;

  const pkg = getPackageById(packageId);
  if (!pkg) return null;

  return {
    key,
    kind: "package",
    packageId,
    name: pkg.name,
    price: pkg.price,
    typ: "pakiet",
    reason,
  };
}

function catalogToSuggestion(
  entry: { id: number; slug: string; nazwa: string; typ: "badanie" | "pakiet"; cena: number | null },
  reason: string,
  inCart: Set<string>,
): CartSuggestion | null {
  const key = `catalog:${entry.slug}`;
  if (inCart.has(key)) return null;
  if (entry.cena == null) return null;

  return {
    key,
    kind: "catalog",
    catalogSlug: entry.slug,
    catalogId: entry.id,
    name: entry.nazwa,
    price: entry.cena,
    typ: entry.typ,
    reason,
  };
}

function suggestionsFromPackages(items: CartItem[], inCart: Set<string>): CartSuggestion[] {
  const out: CartSuggestion[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (item.kind !== "package" || !item.packageId) continue;

    const relations = PACKAGE_RELATIONS[item.packageId] ?? [];
    for (const rel of relations) {
      const suggestion = packageToSuggestion(rel.packageId, rel.reason, inCart);
      if (!suggestion || seen.has(suggestion.key)) continue;
      seen.add(suggestion.key);
      out.push(suggestion);
    }
  }

  return out;
}

function suggestionsFromCatalogCategory(items: CartItem[], inCart: Set<string>): CartSuggestion[] {
  const out: CartSuggestion[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (item.kind !== "catalog" || !item.catalogSlug) continue;

    const catalogItem = getCatalogItemBySlug(item.catalogSlug);
    if (!catalogItem?.kategorie) continue;

    const categoryToken = catalogItem.kategorie.split(",")[0]?.trim();
    if (!categoryToken || categoryToken.length < 3) continue;

    const related = searchCatalog(categoryToken, 6).filter((r) => r.slug !== item.catalogSlug);

    for (const entry of related) {
      const suggestion = catalogToSuggestion(
        entry,
        `Z tej samej kategorii co ${item.name}`,
        inCart,
      );
      if (!suggestion || seen.has(suggestion.key)) continue;
      seen.add(suggestion.key);
      out.push(suggestion);
      if (out.length >= 8) return out;
    }
  }

  return out;
}

function suggestionsFromCatalogHints(items: CartItem[], inCart: Set<string>): CartSuggestion[] {
  const out: CartSuggestion[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const label = item.name;
    for (const hint of CATALOG_SEARCH_HINTS) {
      if (!hint.match.test(label)) continue;

      for (const query of hint.queries) {
        const results = searchCatalog(query.q, 3);
        for (const entry of results) {
          const suggestion = catalogToSuggestion(entry, query.reason, inCart);
          if (!suggestion || seen.has(suggestion.key)) continue;
          seen.add(suggestion.key);
          out.push(suggestion);
        }
      }
    }
  }

  return out;
}

function suggestionsFromPackageGaps(items: CartItem[], inCart: Set<string>): CartSuggestion[] {
  const out: CartSuggestion[] = [];
  const inCartPackageIds = new Set(
    items.filter((i) => i.kind === "package" && i.packageId).map((i) => i.packageId!),
  );

  if (inCartPackageIds.has("control") && !inCartPackageIds.has("vitamin-d")) {
    const s = packageToSuggestion("vitamin-d", "Uzupełnij pakiet kontrolny", inCart);
    if (s) out.push(s);
  }

  if (inCartPackageIds.has("thyroid") && !inCartPackageIds.has("vitamin-d")) {
    const s = packageToSuggestion("vitamin-d", "Warto sprawdzić przy objawach tarczycy", inCart);
    if (s) out.push(s);
  }

  return out;
}

function isSuggestionRedundant(suggestion: CartSuggestion, items: CartItem[]): boolean {
  if (suggestion.kind !== "catalog") return false;

  const name = suggestion.name.toLowerCase();
  for (const item of items) {
    if (item.kind !== "package" || !item.packageId) continue;
    const pkg = getPackageById(item.packageId);
    if (!pkg) continue;
    if (pkg.tests.some((t) => name.includes(t.toLowerCase()) || t.toLowerCase().includes(name.slice(0, 4)))) {
      return true;
    }
  }
  return false;
}

export function getFilteredCartSuggestions(items: CartItem[], limit = 4): CartSuggestion[] {
  if (items.length === 0) return [];

  const inCart = cartKeys(items);
  const merged: CartSuggestion[] = [];
  const seen = new Set<string>();

  const sources = [
    ...suggestionsFromPackages(items, inCart),
    ...suggestionsFromCatalogHints(items, inCart),
    ...suggestionsFromPackageGaps(items, inCart),
    ...suggestionsFromCatalogCategory(items, inCart),
  ];

  for (const suggestion of sources) {
    if (seen.has(suggestion.key)) continue;
    if (isSuggestionRedundant(suggestion, items)) continue;
    seen.add(suggestion.key);
    merged.push(suggestion);
    if (merged.length >= limit) break;
  }

  return merged;
}
