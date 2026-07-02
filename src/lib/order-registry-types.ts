import type { OrderState, PatientProfile } from "./types";

export type OrderPaymentStatus = "demo" | "pending" | "paid" | "failed";

export type StoredOrderRecord = {
  accessToken: string;
  orderNumber: string;
  order: OrderState;
  patients: PatientProfile[];
  grandTotal: number;
  contactEmail: string;
  paymentStatus: OrderPaymentStatus;
  paymentProvider?: string;
  paymentExternalId?: string;
  paymentRedirectUrl?: string;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicOrderView = {
  orderNumber: string;
  accessToken: string;
  paymentStatus: OrderPaymentStatus;
  grandTotal: number;
  order: Pick<
    OrderState,
    | "items"
    | "collectionType"
    | "slot"
    | "location"
    | "homeAddress"
    | "homeVisitPersonCount"
    | "orderNumber"
    | "paymentStatus"
    | "invoiceType"
    | "invoicePersonal"
    | "invoiceCompany"
  >;
  patients: Array<{ fullName: string }>;
  createdAt: string;
  updatedAt: string;
};

export function toPublicOrderView(record: StoredOrderRecord): PublicOrderView {
  return {
    orderNumber: record.orderNumber,
    accessToken: record.accessToken,
    paymentStatus: record.paymentStatus,
    grandTotal: record.grandTotal,
    order: {
      items: record.order.items,
      collectionType: record.order.collectionType,
      slot: record.order.slot,
      location: record.order.location,
      homeAddress: record.order.homeAddress,
      homeVisitPersonCount: record.order.homeVisitPersonCount,
      orderNumber: record.order.orderNumber,
      paymentStatus: record.order.paymentStatus,
      invoiceType: record.order.invoiceType,
      invoicePersonal: record.order.invoicePersonal,
      invoiceCompany: record.order.invoiceCompany,
    },
    patients: record.patients.map((p) => ({ fullName: p.fullName })),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
