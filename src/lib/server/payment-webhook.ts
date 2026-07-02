import type { OrderPaymentStatus } from "@/lib/order-registry-types";
import { getPaymentProvider } from "@/lib/payment-config";
import { sendOrderConfirmationEmail } from "@/lib/server/order-email";
import {
  getOrderByNumber,
  markOrderEmailSent,
  updateOrderPaymentStatus,
} from "@/lib/server/order-registry";
import { getRequiredPatientCount } from "@/lib/patient-storage";

export type PaymentWebhookPayload = {
  orderNumber: string;
  status: OrderPaymentStatus;
  externalId?: string;
  provider?: string;
};

export function verifyPaymentWebhookSecret(request: Request): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const header = request.headers.get("x-payment-webhook-secret");
  return header === secret;
}

export async function handlePaymentWebhook(
  payload: PaymentWebhookPayload,
): Promise<{ ok: boolean; error?: string; emailSent?: boolean }> {
  if (!payload.orderNumber || !payload.status) {
    return { ok: false, error: "Brak orderNumber lub status" };
  }

  if (!["pending", "paid", "failed"].includes(payload.status)) {
    return { ok: false, error: "Nieobsługiwany status" };
  }

  const existing = await getOrderByNumber(payload.orderNumber);
  if (!existing) {
    return { ok: false, error: "Nie znaleziono zamówienia" };
  }

  const updated = await updateOrderPaymentStatus(payload.orderNumber, payload.status, {
    paymentExternalId: payload.externalId,
    paymentProvider: payload.provider ?? getPaymentProvider() ?? undefined,
  });

  if (!updated) {
    return { ok: false, error: "Aktualizacja nie powiodła się" };
  }

  let emailSent = Boolean(updated.emailSentAt);

  if (payload.status === "paid" && !updated.emailSentAt && updated.contactEmail) {
    const result = await sendOrderConfirmationEmail({
      order: updated.order,
      patients: updated.patients.slice(0, getRequiredPatientCount(updated.order)),
      grandTotal: updated.grandTotal,
      contactEmail: updated.contactEmail,
      accessToken: updated.accessToken,
    });

    if (result.sent) {
      emailSent = true;
      await markOrderEmailSent(payload.orderNumber);
    }
  }

  return { ok: true, emailSent };
}
