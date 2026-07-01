import type { LabPackage } from "./types";

export const PACKAGES: LabPackage[] = [
  {
    id: "thyroid",
    name: "Sprawdzenie tarczycy",
    slug: "sprawdzenie-tarczycy",
    price: 149,
    testCount: 5,
    resultTime: "Jutro do 18:00",
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
    resultTime: "Jutro do 14:00",
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
    resultTime: "Jutro do 18:00",
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
    resultTime: "Jutro do 14:00",
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
    resultTime: "Jutro do 18:00",
    noReferral: true,
    tests: ["Glukoza", "Insulina", "HOMA-IR", "TSH", "Kortyzol", "Wit. D"],
    why: "Problemy z wagą często wiążą się z metabolizmem glukozy i hormonów tarczycy — ten pakiet je obejmuje.",
    badge: "Rekomendacja AI",
  },
];

export function getPackageById(id: string): LabPackage | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function getPackageBySlug(slug: string): LabPackage | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}
