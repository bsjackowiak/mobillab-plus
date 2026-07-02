import {
  addCartItem,
  addCatalogItem,
  addPackageItem,
  catalogCartKey,
  getCartLinesForProduct,
  getProductKey,
  isProductInCartForPatient,
  packageCartKey,
} from "./cart";
import { MAX_HOME_VISIT_PERSONS } from "./collection";
import { syncHomeVisitPersonCount } from "./cart-patients";
import { getPackageById } from "./packages";
import { patientShortLabel } from "./patient-onboarding";
import { getOrder } from "./order-storage";
import {
  createPatientId,
  getLastSelectedPatientId,
  getPatients,
  patientHasCompleteData,
  savePatients,
  setLastSelectedPatientId,
} from "./patient-storage";
import type { CartItem, PatientProfile } from "./types";

export type AddCatalogProduct = {
  kind: "catalog";
  slug: string;
  id: number;
  nazwa: string;
  cena: number | null;
  typ: "badanie" | "pakiet";
};

export type AddPackageProduct = {
  kind: "package";
  packageId: string;
};

export type AddProductInput = AddCatalogProduct | AddPackageProduct;

export type AddToCartResult =
  | { status: "added"; patientId?: string; patientLabel: string }
  | { status: "duplicate"; patientLabel: string }
  | { status: "unavailable" }
  | { status: "needs-picker" }
  | { status: "needs-add-patient" };

export function getProductKeyFromInput(input: AddProductInput): string {
  return input.kind === "package"
    ? packageCartKey(input.packageId)
    : catalogCartKey(input.slug);
}

export function isProductInCart(productKey: string): boolean {
  return getCartLinesForProduct(productKey).length > 0;
}

export function ensureContactPatient(): PatientProfile {
  const patients = getPatients();
  if (patients.length > 0) {
    const first = patients[0]!;
    setLastSelectedPatientId(first.id);
    return first;
  }

  const contact: PatientProfile = {
    id: createPatientId(),
    fullName: "",
    email: "",
    pesel: "",
  };
  savePatients([contact]);
  setLastSelectedPatientId(contact.id);
  return contact;
}

export function resolvePatientIdForAdd(
  patients: PatientProfile[],
  activePatientId?: string | null,
): string | undefined {
  if (activePatientId && patients.some((p) => p.id === activePatientId)) {
    return activePatientId;
  }

  const lastId = getLastSelectedPatientId();
  if (lastId && patients.some((p) => p.id === lastId)) {
    return lastId;
  }

  if (patients.length === 1) return patients[0]!.id;
  if (patients.length === 0) return ensureContactPatient().id;
  return undefined;
}

function duplicateResult(patients: PatientProfile[], patientId: string): AddToCartResult {
  const patientIndex = patients.findIndex((p) => p.id === patientId);
  const patient = patients[patientIndex];
  const patientLabel = patient
    ? patientDisplayLabel(patient, Math.max(patientIndex, 0))
    : "osoby";
  return { status: "duplicate", patientLabel };
}

export function getEligiblePatientsForProduct(
  productKey: string,
  patients: PatientProfile[] = getPatients(),
): PatientProfile[] {
  return patients.filter(
    (patient) =>
      patientHasCompleteData(patient) &&
      !isProductInCartForPatient(productKey, patient.id),
  );
}

export function getCompletePatientsForPicker(
  patients: PatientProfile[] = getPatients(),
): PatientProfile[] {
  return patients.filter((patient) => patientHasCompleteData(patient));
}

export function canRegisterMorePatients(patients: PatientProfile[] = getPatients()): boolean {
  const completeCount = patients.filter((patient) => patientHasCompleteData(patient)).length;
  if (completeCount >= MAX_HOME_VISIT_PERSONS) return false;

  const order = getOrder();
  const declared = order?.homeVisitPersonCount ?? 1;
  return completeCount < declared || completeCount < MAX_HOME_VISIT_PERSONS;
}

export function patientDisplayLabel(patient: PatientProfile, index: number): string {
  return patientShortLabel(patient, index);
}

export function isProductInCartForActivePatient(
  productKey: string,
  patients: PatientProfile[],
  activePatientId?: string | null,
): boolean {
  const patientId = resolvePatientIdForAdd(patients, activePatientId);
  return isProductInCartForPatient(productKey, patientId);
}

function addForPatientId(
  input: AddProductInput,
  productKey: string,
  patients: PatientProfile[],
  patientId: string,
): AddToCartResult {
  const patientIndex = patients.findIndex((p) => p.id === patientId);
  const patient = patients[patientIndex];
  const patientLabel = patient
    ? patientDisplayLabel(patient, Math.max(patientIndex, 0))
    : "osoby";

  if (isProductInCartForPatient(productKey, patientId)) {
    return { status: "duplicate", patientLabel };
  }

  let added = false;

  if (input.kind === "package") {
    const pkg = getPackageById(input.packageId);
    if (!pkg) return { status: "unavailable" };
    added = addPackageItem(
      { packageId: input.packageId, name: pkg.name, price: pkg.price },
      patientId,
    );
  } else {
    if (input.cena == null) return { status: "unavailable" };
    added = addCatalogItem(
      {
        slug: input.slug,
        id: input.id,
        nazwa: input.nazwa,
        cena: input.cena,
        typ: input.typ,
      },
      patientId,
    );
  }

  if (!added) {
    return { status: "duplicate", patientLabel };
  }

  setLastSelectedPatientId(patientId);
  syncHomeVisitPersonCount();
  notifyCartAdded(patientLabel);
  return { status: "added", patientId, patientLabel };
}

export function addProductForPatient(
  input: AddProductInput,
  options?: { patientId?: string },
): AddToCartResult {
  const productKey = getProductKeyFromInput(input);
  let patients = getPatients();

  if (patients.length === 0) {
    ensureContactPatient();
    patients = getPatients();
  }

  if (options?.patientId) {
    return addForPatientId(input, productKey, patients, options.patientId);
  }

  const completePatients = patients.filter((patient) => patientHasCompleteData(patient));
  const eligiblePatients = getEligiblePatientsForProduct(productKey, patients);

  if (eligiblePatients.length === 1) {
    return addForPatientId(input, productKey, patients, eligiblePatients[0]!.id);
  }

  if (eligiblePatients.length > 1) {
    return { status: "needs-picker" };
  }

  if (completePatients.length > 0) {
    if (canRegisterMorePatients(patients)) {
      return { status: "needs-add-patient" };
    }
    const lastUsedId = resolvePatientIdForAdd(patients);
    if (lastUsedId && isProductInCartForPatient(productKey, lastUsedId)) {
      return duplicateResult(patients, lastUsedId);
    }
    return { status: "needs-picker" };
  }

  const guestId = resolvePatientIdForAdd(patients);
  if (!guestId) {
    const guest = ensureContactPatient();
    return addForPatientId(input, productKey, getPatients(), guest.id);
  }
  if (isProductInCartForPatient(productKey, guestId)) {
    return duplicateResult(patients, guestId);
  }
  return addForPatientId(input, productKey, patients, guestId);
}

export function duplicateCartItemForPatient(item: CartItem, patientId: string): AddToCartResult {
  const productKey = getProductKey(item);
  const patients = getPatients();
  const patientIndex = patients.findIndex((p) => p.id === patientId);
  const patient = patients[patientIndex];
  const patientLabel = patient
    ? patientDisplayLabel(patient, Math.max(patientIndex, 0))
    : "osoby";

  if (isProductInCartForPatient(productKey, patientId)) {
    return { status: "duplicate", patientLabel };
  }

  const duplicate: CartItem = {
    ...item,
    key: `${patientId}:${productKey}`,
    productKey,
    patientId,
  };

  const added = addCartItem(duplicate);
  if (!added) {
    return { status: "duplicate", patientLabel };
  }

  syncHomeVisitPersonCount();
  notifyCartAdded(patientLabel);
  return { status: "added", patientId, patientLabel };
}

export function notifyCartAdded(patientLabel: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("labflow-cart-added", { detail: { patientLabel } }),
  );
}

export function formatAddToast(result: AddToCartResult): string {
  switch (result.status) {
    case "added":
      return `Dodano dla ${result.patientLabel}`;
    case "duplicate":
      return `Już w koszyku u wszystkich osób`;
    case "unavailable":
      return "Niedostępne online";
    case "needs-picker":
      return "Wybierz osobę";
    case "needs-add-patient":
      return "Dodaj osobę do zamówienia";
  }
}

/** Komunikat lokalny — bez „Dodano dla” (pokazuje pasek u góry). */
export function formatAddFeedback(result: AddToCartResult): string | null {
  if (result.status === "added") return null;
  const message = formatAddToast(result);
  return message || null;
}
