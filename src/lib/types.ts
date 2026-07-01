export type CollectionType = "facility" | "home";

export type CartItem = {
  key: string;
  kind: "package" | "catalog";
  packageId?: string;
  catalogSlug?: string;
  catalogId?: number;
  name: string;
  price: number | null;
  typ?: "badanie" | "pakiet";
  patientId?: string;
};

export type LabPackage = {
  id: string;
  name: string;
  slug: string;
  price: number;
  testCount: number;
  resultTime: string;
  noReferral: boolean;
  tests: string[];
  why: string;
  badge?: string;
};

export type WizardAnswers = {
  concern: string;
  duration: string;
  purpose: string;
};

export type OrderState = {
  items: CartItem[];
  collectionType?: CollectionType;
  facilityId?: string;
  slot?: string;
  homeAddress?: string;
  homeVisitPersonCount?: number;
  location?: string;
  orderNumber?: string;
};

export type PatientProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  pesel: string;
};
