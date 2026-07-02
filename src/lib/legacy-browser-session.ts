"use client";

import { emptySession, type SessionData } from "@/lib/session-types";
import type { CartItem, OrderState, PatientProfile } from "@/lib/types";
import { getPackageById } from "@/lib/packages";

const ORDER_KEY = "labflow-order";
const PATIENTS_KEY = "mobillab-patients";
const LEGACY_PATIENT_KEY = "labflow-patient";
const LAST_PATIENT_KEY = "mobillab-last-patient";

type LegacyOrder = OrderState & {
  packageId?: string;
  catalogSlug?: string;
  catalogId?: number;
  catalogName?: string;
  catalogPrice?: number | null;
};

function migrateLegacyOrder(raw: LegacyOrder | null): OrderState {
  if (!raw) return { items: [] };

  if (raw.items?.length) {
    return {
      orderNumber: raw.orderNumber,
      collectionType: raw.collectionType,
      facilityId: raw.facilityId,
      slot: raw.slot,
      homeAddress: raw.homeAddress,
      homeVisitPersonCount: raw.homeVisitPersonCount,
      location: raw.location,
      invoiceType: raw.invoiceType,
      invoicePersonal: raw.invoicePersonal,
      invoiceCompany: raw.invoiceCompany,
      items: raw.items,
    };
  }

  const items: CartItem[] = [];

  if (raw.packageId) {
    const pkg = getPackageById(raw.packageId);
    const productKey = `package:${raw.packageId}`;
    items.push({
      key: `unassigned:${productKey}`,
      productKey,
      kind: "package",
      packageId: raw.packageId,
      name: pkg?.name ?? raw.catalogName ?? raw.packageId,
      price: pkg?.price ?? raw.catalogPrice ?? null,
    });
  } else if (raw.catalogSlug) {
    const productKey = `catalog:${raw.catalogSlug}`;
    items.push({
      key: `unassigned:${productKey}`,
      productKey,
      kind: "catalog",
      catalogSlug: raw.catalogSlug,
      catalogId: raw.catalogId,
      name: raw.catalogName ?? raw.catalogSlug,
      price: raw.catalogPrice ?? null,
      typ: "badanie",
    });
  }

  return {
    orderNumber: raw.orderNumber,
    slot: raw.slot,
    location: raw.location,
    items,
  };
}

function readLegacyOrder(): OrderState {
  if (typeof window === "undefined") return { items: [] };
  const raw = sessionStorage.getItem(ORDER_KEY);
  if (!raw) return { items: [] };
  try {
    return migrateLegacyOrder(JSON.parse(raw) as LegacyOrder);
  } catch {
    return { items: [] };
  }
}

function readLegacyPatients(): PatientProfile[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(PATIENTS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as PatientProfile[];
    } catch {
      return [];
    }
  }

  const legacy = localStorage.getItem(LEGACY_PATIENT_KEY);
  if (!legacy) return [];

  try {
    return [JSON.parse(legacy) as PatientProfile];
  } catch {
    return [];
  }
}

function readLegacyLastPatientId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_PATIENT_KEY);
}

export function readLegacyBrowserSession(): SessionData {
  if (typeof window === "undefined") return emptySession();

  const order = readLegacyOrder();
  const patients = readLegacyPatients();
  const lastPatientId = readLegacyLastPatientId();

  if (!order.items.length && patients.length === 0 && !lastPatientId) {
    return emptySession();
  }

  return {
    order,
    patients,
    lastPatientId,
    completedOrders: [],
    updatedAt: new Date().toISOString(),
  };
}

export function clearLegacyBrowserSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ORDER_KEY);
  localStorage.removeItem(PATIENTS_KEY);
  localStorage.removeItem(LEGACY_PATIENT_KEY);
  localStorage.removeItem(LAST_PATIENT_KEY);
}
