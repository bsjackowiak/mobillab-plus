export type CollectionType = "facility" | "home";

export type CartItem = {
  key: string;
  productKey: string;
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

export type InvoiceType = "none" | "personal" | "company";

export type InvoicePersonalData = {
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
};

export type InvoiceCompanyData = {
  companyName: string;
  nip: string;
  address: string;
  postalCode: string;
  city: string;
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
  paymentStatus?: "demo" | "pending" | "paid" | "failed";
  invoiceType?: InvoiceType;
  invoicePersonal?: InvoicePersonalData;
  invoiceCompany?: InvoiceCompanyData;
};

export type PatientRelation = "self" | "child" | "other";

export type PatientAgeCategory = "adult" | "child_u4" | "child_4_12";

export type PatientOnboardingInput = {
  relation: PatientRelation;
  firstName: string;
  lastName: string;
  pesel: string;
  birthDate?: string;
  ageCategory: PatientAgeCategory;
  email?: string;
  phone?: string;
  consent?: boolean;
};

export type PatientProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  pesel: string;
  birthDate?: string;
  relation?: PatientRelation;
  ageCategory?: PatientAgeCategory;
};
