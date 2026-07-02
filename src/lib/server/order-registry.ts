import { randomUUID } from "crypto";
import type { OrderPaymentStatus, StoredOrderRecord } from "@/lib/order-registry-types";
import type { OrderState, PatientProfile } from "@/lib/types";
import {
  readFileOrderByNumber,
  readFileOrderByToken,
  writeFileOrder,
} from "@/lib/server/order-file-store";
import {
  isRedisOrderStoreConfigured,
  readRedisOrderByNumber,
  readRedisOrderByToken,
  writeRedisOrder,
} from "@/lib/server/order-redis-store";
import { getSessionStoreBackend } from "@/lib/server/session-store";

function useRedisOrders(): boolean {
  const forced = process.env.ORDER_STORE?.toLowerCase();
  if (forced === "file") return false;
  if (forced === "redis") return true;
  return getSessionStoreBackend() === "redis" && isRedisOrderStoreConfigured();
}

export function createOrderAccessToken(): string {
  return randomUUID();
}

export async function saveOrderRecord(record: StoredOrderRecord): Promise<void> {
  if (useRedisOrders()) {
    await writeRedisOrder(record);
  } else {
    await writeFileOrder(record);
  }
}

export async function getOrderByToken(token: string): Promise<StoredOrderRecord | null> {
  if (useRedisOrders()) {
    return readRedisOrderByToken(token);
  }
  return readFileOrderByToken(token);
}

export async function getOrderByNumber(orderNumber: string): Promise<StoredOrderRecord | null> {
  if (useRedisOrders()) {
    return readRedisOrderByNumber(orderNumber);
  }
  return readFileOrderByNumber(orderNumber);
}

export async function createStoredOrder(input: {
  order: OrderState;
  patients: PatientProfile[];
  grandTotal: number;
  contactEmail: string;
  paymentStatus: OrderPaymentStatus;
  paymentProvider?: string;
}): Promise<StoredOrderRecord> {
  const now = new Date().toISOString();
  const accessToken = createOrderAccessToken();
  const orderNumber = input.order.orderNumber!;

  const record: StoredOrderRecord = {
    accessToken,
    orderNumber,
    order: input.order,
    patients: input.patients,
    grandTotal: input.grandTotal,
    contactEmail: input.contactEmail,
    paymentStatus: input.paymentStatus,
    paymentProvider: input.paymentProvider,
    createdAt: now,
    updatedAt: now,
  };

  await saveOrderRecord(record);
  return record;
}

export async function markOrderEmailSent(orderNumber: string): Promise<void> {
  const record = await getOrderByNumber(orderNumber);
  if (!record) return;
  await saveOrderRecord({
    ...record,
    emailSentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateOrderPaymentStatus(
  orderNumber: string,
  paymentStatus: OrderPaymentStatus,
  extra?: {
    paymentExternalId?: string;
    paymentProvider?: string;
    paymentRedirectUrl?: string;
  },
): Promise<StoredOrderRecord | null> {
  const record = await getOrderByNumber(orderNumber);
  if (!record) return null;

  const updated: StoredOrderRecord = {
    ...record,
    paymentStatus,
    paymentExternalId: extra?.paymentExternalId ?? record.paymentExternalId,
    paymentProvider: extra?.paymentProvider ?? record.paymentProvider,
    paymentRedirectUrl: extra?.paymentRedirectUrl ?? record.paymentRedirectUrl,
    order: {
      ...record.order,
      paymentStatus,
    },
    updatedAt: new Date().toISOString(),
  };

  await saveOrderRecord(updated);
  return updated;
}
