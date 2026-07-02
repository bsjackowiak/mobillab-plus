import { getCollectionFee, orderHasCollection } from "@/lib/collection";
import { validateInvoice } from "@/lib/invoice";
import { orderHasItem } from "@/lib/order-helpers";
import {
  getRequiredPatientCount,
  patientHasCompleteData,
  patientHasContactData,
} from "@/lib/patient-storage";
import type {
  InvoiceCompanyData,
  InvoicePersonalData,
  InvoiceType,
  OrderState,
  PatientProfile,
} from "@/lib/types";

export function generateServerOrderNumber(): string {
  return `ML+${Math.floor(10000 + Math.random() * 90000)}`;
}

export function computeServerGrandTotal(order: OrderState): number | null {
  if (order.items.length === 0) return null;
  let itemsTotal = 0;
  for (const item of order.items) {
    if (item.price == null) return null;
    itemsTotal += item.price;
  }
  return itemsTotal + getCollectionFee(order.collectionType);
}

function getCartPatientIds(order: OrderState): string[] {
  const ids = new Set<string>();
  for (const item of order.items) {
    if (item.patientId) ids.add(item.patientId);
  }
  return [...ids];
}

export function hasRequiredPatientsInSession(
  order: OrderState,
  patients: PatientProfile[],
): boolean {
  const cartIds = getCartPatientIds(order);
  const idsToValidate =
    cartIds.length > 0
      ? cartIds
      : patients.slice(0, getRequiredPatientCount(order)).map((p) => p.id);

  if (idsToValidate.length === 0) return false;

  const patientMap = new Map(patients.map((p) => [p.id, p]));
  const identityComplete = idsToValidate.every((id) => {
    const patient = patientMap.get(id);
    return patient && patientHasCompleteData(patient);
  });
  if (!identityComplete) return false;

  const contact = patients[0];
  return Boolean(contact && patientHasContactData(contact));
}

export type ConfirmCheckoutBody = {
  invoiceType: InvoiceType;
  invoicePersonal?: InvoicePersonalData;
  invoiceCompany?: InvoiceCompanyData;
  location: string;
  demoAcknowledged?: boolean;
};

export function validateCheckoutConfirm(
  order: OrderState | null,
  patients: PatientProfile[],
  body: ConfirmCheckoutBody,
  options: { paymentMode: "demo" | "live"; demoAckRequired: boolean },
): string | null {
  if (!orderHasItem(order)) return "Koszyk jest pusty";
  if (!orderHasCollection(order)) return "Brak wybranego pobrania";
  if (!hasRequiredPatientsInSession(order!, patients)) return "Uzupełnij dane pacjentów";

  const grandTotal = computeServerGrandTotal(order!);
  if (grandTotal == null) return "Brak ceny zamówienia";

  if (body.invoiceType !== "none" && body.invoiceType !== "personal" && body.invoiceType !== "company") {
    return "Wybierz rodzaj faktury";
  }

  const invoiceErrors = validateInvoice(
    body.invoiceType,
    body.invoicePersonal ?? { fullName: "", address: "", postalCode: "", city: "" },
    body.invoiceCompany ?? {
      companyName: "",
      nip: "",
      address: "",
      postalCode: "",
      city: "",
    },
  );
  if (Object.keys(invoiceErrors).length > 0) {
    return "Uzupełnij dane do faktury";
  }

  if (options.paymentMode === "demo" && options.demoAckRequired && !body.demoAcknowledged) {
    return "Potwierdź, że rozumiesz tryb demonstracyjny";
  }

  return null;
}
