import type { LabPackage } from "./types";

export const PACKAGES: LabPackage[] = [
  {
    id: "thyroid",
    name: "Sprawdzenie tarczycy",
    slug: "sprawdzenie-tarczycy",
    price: 149,
    testCount: 5,
    resultTime: "1 dzień",
    noReferral: true,
    tests: ["TSH", "FT4", "FT3", "anty-TPO", "anty-TG"],
    why: "Zmęczenie trwające dłużej niż miesiąc może wskazywać na zaburzenia tarczycy. Pakiet obejmuje TSH, FT4 i FT3 — badania rekomendowane w pierwszej linii diagnostyki.",
    badge: "Rekomendacja AI",
  },
  {
    id: "cholesterol",
    name: "Cholesterol + LDL",
    slug: "cholesterol-ldl",
    price: 89,
    testCount: 3,
    resultTime: "1 dzień",
    noReferral: true,
    tests: ["Cholesterol całkowity", "LDL", "HDL"],
    why: "Regularna kontrola lipidów pomaga ocenić ryzyko sercowo-naczyniowe i zaplanować profilaktykę.",
  },
  {
    id: "control",
    name: "Pakiet kontrolny",
    slug: "pakiet-kontrolny",
    price: 199,
    testCount: 8,
    resultTime: "1 dzień",
    noReferral: true,
    tests: ["Morfologia", "Glukoza", "TSH", "Cholesterol", "ALT", "AST", "Kreatynina", "Wit. D"],
    why: "Kompleksowy przegląd podstawowych parametrów zdrowia — idealny na coroczną kontrolę.",
  },
  {
    id: "vitamin-d",
    name: "Witamina D",
    slug: "witamina-d",
    price: 59,
    testCount: 1,
    resultTime: "1 dzień",
    noReferral: true,
    tests: ["25-OH witamina D"],
    why: "Niski poziom witaminy D jest częsty i może tłumaczyć zmęczenie, osłabienie i pogorszenie nastroju.",
  },
  {
    id: "weight",
    name: "Pakiet metaboliczny",
    slug: "pakiet-metaboliczny",
    price: 179,
    testCount: 6,
    resultTime: "1 dzień",
    noReferral: true,
    tests: ["Glukoza", "Insulina", "HOMA-IR", "TSH", "Kortyzol", "Wit. D"],
    why: "Problemy z wagą często wiążą się z metabolizmem glukozy i hormonów tarczycy — ten pakiet je obejmuje.",
    badge: "Rekomendacja AI",
  },
  {
    id: "premium",
    name: "Pakiet rozszerzony",
    slug: "pakiet-rozszerzony",
    price: 329,
    testCount: 12,
    resultTime: "1 dzień",
    noReferral: true,
    tests: [
      "Morfologia",
      "Glukoza",
      "Lipidogram",
      "TSH",
      "FT4",
      "ALT",
      "AST",
      "Kreatynina",
      "Wit. D",
      "B12",
      "Żelazo",
      "CRP",
    ],
    why: "Najszerszy przegląd — krew, metabolizm, tarczyca, wątroba i nerki w jednym pobraniu.",
  },
];

export type PackageTier = "minimum" | "medium" | "maximum";

export const RECOMMENDED_TIERS: {
  tier: PackageTier;
  label: string;
  packageId: string;
  hint: string;
  featured?: boolean;
}[] = [
  {
    tier: "minimum",
    label: "Minimum",
    packageId: "vitamin-d",
    hint: "Szybka kontrola jednego parametru",
  },
  {
    tier: "medium",
    label: "Medium",
    packageId: "control",
    hint: "Coroczna kontrola podstawowych wyników",
    featured: true,
  },
  {
    tier: "maximum",
    label: "Maksimum",
    packageId: "premium",
    hint: "Pełny przegląd zdrowia w jednym pobraniu",
  },
];

export function getPackageById(id: string): LabPackage | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function getPackageBySlug(slug: string): LabPackage | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}
