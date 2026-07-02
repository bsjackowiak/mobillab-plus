import { z } from "zod";
import { normalizeSession } from "@/lib/server/session-normalize";
import type { SessionData } from "@/lib/session-types";

export const SESSION_PUT_MAX_BYTES = 256_000;

const MAX_CART_ITEMS = 50;
const MAX_PATIENTS = 20;
const MAX_COMPLETED_ORDERS = 30;

const shortText = z.string().trim().max(200);
const mediumText = z.string().trim().max(500);

const cartItemSchema = z.object({
  key: shortText,
  productKey: shortText,
  kind: z.enum(["package", "catalog"]),
  packageId: z.string().trim().max(80).optional(),
  catalogSlug: z.string().trim().max(120).optional(),
  catalogId: z.number().int().nonnegative().optional(),
  name: z.string().trim().max(300),
  price: z.number().finite().nullable(),
  typ: z.enum(["badanie", "pakiet"]).optional(),
  patientId: z.string().trim().max(80).optional(),
});

const orderSchema = z.object({
  items: z.array(cartItemSchema).max(MAX_CART_ITEMS),
  collectionType: z.enum(["facility", "home"]).optional(),
  facilityId: z.string().trim().max(80).optional(),
  slot: z.string().trim().max(80).optional(),
  homeAddress: mediumText.optional(),
  homeVisitPersonCount: z.number().int().min(1).max(20).optional(),
  location: mediumText.optional(),
  orderNumber: z.string().trim().max(40).optional(),
  paymentStatus: z.enum(["demo", "pending", "paid", "failed"]).optional(),
  invoiceType: z.enum(["none", "personal", "company"]).optional(),
  invoicePersonal: z
    .object({
      fullName: z.string().trim().max(200),
      address: mediumText,
      postalCode: z.string().trim().max(12),
      city: z.string().trim().max(120),
    })
    .optional(),
  invoiceCompany: z
    .object({
      companyName: z.string().trim().max(200),
      nip: z.string().trim().max(15),
      address: mediumText,
      postalCode: z.string().trim().max(12),
      city: z.string().trim().max(120),
    })
    .optional(),
});

const patientSchema = z.object({
  id: z.string().trim().max(80),
  fullName: z.string().trim().max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(24).optional(),
  pesel: z.string().trim().max(11),
  birthDate: z.string().trim().max(10).optional(),
  relation: z.enum(["self", "child", "other"]).optional(),
  ageCategory: z.enum(["adult", "child_u4", "child_4_12"]).optional(),
});

const completedOrderSchema = orderSchema.extend({
  completedAt: z.string().trim().max(40),
});

export const sessionPutSchema = z.object({
  order: orderSchema.optional(),
  patients: z.array(patientSchema).max(MAX_PATIENTS).optional(),
  lastPatientId: z.string().trim().max(80).nullable().optional(),
  completedOrders: z.array(completedOrderSchema).max(MAX_COMPLETED_ORDERS).optional(),
  updatedAt: z.string().trim().max(40).optional(),
});

export type SessionPutParseResult =
  | { ok: true; data: SessionData }
  | { ok: false; error: string };

export function parseSessionPutPayload(body: unknown): SessionPutParseResult {
  const parsed = sessionPutSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Invalid session payload" };
  }

  const data = normalizeSession({
    order: parsed.data.order ?? { items: [] },
    patients: parsed.data.patients ?? [],
    lastPatientId: parsed.data.lastPatientId ?? null,
    completedOrders: parsed.data.completedOrders ?? [],
    updatedAt: new Date().toISOString(),
  });

  return { ok: true, data };
}
