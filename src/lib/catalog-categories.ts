import type { CatalogItem } from "@/lib/catalog";

export const HIDDEN_CATEGORY_LABELS = new Set([
  "DiagBANK",
  "Badania z bezpłatną automatyczną interpretacją",
]);

function compareCategoryNames(a: string, b: string): number {
  return a.localeCompare(b, "pl", { sensitivity: "base" });
}

export function parseCategorySegments(kategorie: string): string[] {
  return kategorie
    .split("|")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 2 && !HIDDEN_CATEGORY_LABELS.has(segment));
}

export function resolveCategoryRoot(segment: string): string {
  if (segment.startsWith("Alergologia")) return "Alergologia";
  if (segment.startsWith("Infekcje")) return "Infekcje";
  return segment;
}

export function primaryCategoryLabel(kategorie: string): string {
  const segments = parseCategorySegments(kategorie);
  if (segments.length === 0) return "";
  return resolveCategoryRoot(segments[0]!);
}

export type CatalogCategorySection = {
  name: string;
  count: number;
  subcategories: { name: string; count: number }[];
};

export type FlatCategoryEntry = {
  name: string;
  count: number;
};

export function buildCatalogCategorySections(
  items: Pick<CatalogItem, "kategorie">[],
): CatalogCategorySection[] {
  const rootMap = new Map<string, { count: number; subs: Map<string, number> }>();

  for (const item of items) {
    const segments = parseCategorySegments(item.kategorie || "");
    if (segments.length === 0) continue;

    const root = resolveCategoryRoot(segments[0]!);
    if (HIDDEN_CATEGORY_LABELS.has(root)) continue;

    const entry = rootMap.get(root) ?? { count: 0, subs: new Map<string, number>() };
    entry.count += 1;

    const subNames = new Set<string>();
    for (const segment of segments.slice(1)) {
      subNames.add(segment);
    }
    if (segments[0] !== root) {
      subNames.add(segments[0]!);
    }

    for (const subName of subNames) {
      entry.subs.set(subName, (entry.subs.get(subName) ?? 0) + 1);
    }

    rootMap.set(root, entry);
  }

  return [...rootMap.entries()]
    .map(([name, entry]) => ({
      name,
      count: entry.count,
      subcategories: [...entry.subs.entries()]
        .map(([subName, count]) => ({ name: subName, count }))
        .sort((a, b) => compareCategoryNames(a.name, b.name)),
    }))
    .sort((a, b) => compareCategoryNames(a.name, b.name));
}

export function buildFlatCategoryList(
  items: Pick<CatalogItem, "kategorie">[],
): FlatCategoryEntry[] {
  const sections = buildCatalogCategorySections(items);
  const rootsWithSubs = new Set(
    sections.filter((section) => section.subcategories.length > 0).map((section) => section.name),
  );
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const label of flatLabelsForItem(item.kategorie || "", rootsWithSubs)) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => compareCategoryNames(a.name, b.name));
}

function flatLabelsForItem(kategorie: string, rootsWithSubs: Set<string>): string[] {
  const segments = parseCategorySegments(kategorie);
  if (segments.length === 0) return [];

  const root = resolveCategoryRoot(segments[0]!);
  if (HIDDEN_CATEGORY_LABELS.has(root)) return [];

  if (!rootsWithSubs.has(root)) {
    return [root];
  }

  const labels = new Set<string>();
  if (segments[0] !== root) {
    labels.add(segments[0]!);
  }
  for (const segment of segments.slice(1)) {
    labels.add(segment);
  }
  if (labels.size === 0) {
    labels.add(root);
  }

  return [...labels];
}

export type CatalogCategoryLetterGroup = {
  letter: string;
  items: FlatCategoryEntry[];
};

export function groupFlatCategoriesByLetter(
  items: FlatCategoryEntry[],
): CatalogCategoryLetterGroup[] {
  const byLetter = new Map<string, FlatCategoryEntry[]>();

  for (const item of items) {
    const letter = item.name.charAt(0).toLocaleUpperCase("pl") || "#";
    const bucket = byLetter.get(letter) ?? [];
    bucket.push(item);
    byLetter.set(letter, bucket);
  }

  return [...byLetter.entries()]
    .sort(([a], [b]) => compareCategoryNames(a, b))
    .map(([letter, entries]) => ({ letter, items: entries }));
}

/** @deprecated Użyj groupFlatCategoriesByLetter() */
export type CatalogCategoryLetterGroupLegacy = {
  letter: string;
  sections: CatalogCategorySection[];
};

/** @deprecated Użyj groupFlatCategoriesByLetter() */
export function groupCategorySectionsByLetter(
  sections: CatalogCategorySection[],
): CatalogCategoryLetterGroupLegacy[] {
  const byLetter = new Map<string, CatalogCategorySection[]>();

  for (const section of sections) {
    const letter = section.name.charAt(0).toLocaleUpperCase("pl") || "#";
    const bucket = byLetter.get(letter) ?? [];
    bucket.push(section);
    byLetter.set(letter, bucket);
  }

  return [...byLetter.entries()]
    .sort(([a], [b]) => compareCategoryNames(a, b))
    .map(([letter, entries]) => ({ letter, sections: entries }));
}

export function formatCategoryCount(count: number): string {
  if (count === 1) return "1 badanie";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} badania`;
  }
  return `${count} badań`;
}

export function filterFlatCategories(
  items: FlatCategoryEntry[],
  query: string,
): FlatCategoryEntry[] {
  const token = query.trim().toLowerCase();
  if (token.length < 2) return items;
  return items.filter((item) => item.name.toLowerCase().includes(token));
}

/** @deprecated Użyj filterFlatCategories() */
export function filterCategorySections(
  sections: CatalogCategorySection[],
  query: string,
): CatalogCategorySection[] {
  const token = query.trim().toLowerCase();
  if (token.length < 2) return sections;

  return sections
    .map((section) => {
      const rootMatch = section.name.toLowerCase().includes(token);
      const matchingSubs = section.subcategories.filter((sub) =>
        sub.name.toLowerCase().includes(token),
      );

      if (rootMatch) return section;
      if (matchingSubs.length === 0) return null;

      return {
        ...section,
        subcategories: matchingSubs,
      };
    })
    .filter((section): section is CatalogCategorySection => section != null);
}
