export type Facility = {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  rating: number;
  reviews: number;
  openUntil: string;
  theme: "blue" | "violet" | "emerald";
};

export const FACILITIES: Facility[] = [
  {
    id: "diag-centrum",
    name: "Diagnostyka Centrum",
    address: "ul. Marszałkowska 12",
    city: "Warszawa",
    distance: "800 m",
    rating: 4.9,
    reviews: 312,
    openUntil: "19:00",
    theme: "blue",
  },
  {
    id: "medlab-mokotow",
    name: "MedLab Mokotów",
    address: "ul. Puławska 48",
    city: "Warszawa",
    distance: "1,2 km",
    rating: 4.8,
    reviews: 189,
    openUntil: "18:30",
    theme: "violet",
  },
  {
    id: "lab-plus",
    name: "Lab+ Praga",
    address: "ul. Targowa 72",
    city: "Warszawa",
    distance: "2,4 km",
    rating: 4.7,
    reviews: 96,
    openUntil: "20:00",
    theme: "emerald",
  },
];

export const DEFAULT_FACILITY = FACILITIES[0];

export function getFacilityById(id: string): Facility | undefined {
  return FACILITIES.find((f) => f.id === id);
}
