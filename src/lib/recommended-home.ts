/** Pojedyncze badania — slugi z cennika Diagnostyki. */
export const RECOMMENDED_BADANIA_SLUGS = [
  "tsh",
  "morfologia-krwi-pelna",
  "cholesterol-calkowity",
  "glukoza",
  "witamina-d-metabolit-25oh",
  "crp-ilosciowo",
] as const;

/** Własne pakiety LabFlow (packages.ts). */
export const RECOMMENDED_PACKAGE_IDS = [
  "control",
  "thyroid",
  "cholesterol",
  "vitamin-d",
  "premium",
] as const;

export type HomeRecommendedTab = "badanie" | "pakiet";

/** Ile pozycji ładować na raz przy scrollu na stronie głównej. */
export const HOME_RECOMMENDED_PAGE_SIZE = 3;

/** Skróty na stronie głównej — slugi z cennika, link jak w /badania. */
export const POPULAR_HOME_CHIPS = [
  { label: "Pakiet kontrolny", slug: "e-pakiet-badania-kontrolne" },
  { label: "Tarczyca", slug: "e-pakiet-tarczycowy" },
  { label: "Cholesterol", slug: "cholesterol-calkowity" },
  { label: "Wit. D", slug: "witamina-d-metabolit-25oh" },
] as const;
