import { getPaymentProvider } from "@/lib/payment-config";
import type { StoredOrderRecord } from "@/lib/order-registry-types";
import { createPayUOrder } from "./payu";

export type PaymentSessionResult = {
  redirectUri: string;
  externalId: string;
  provider: string;
};

export async function createPaymentSession(
  record: StoredOrderRecord,
  customerIp: string,
): Promise<PaymentSessionResult> {
  const provider = getPaymentProvider();
  if (provider === "payu") {
    const result = await createPayUOrder(record, customerIp);
    return {
      redirectUri: result.redirectUri,
      externalId: result.orderId,
      provider: "payu",
    };
  }

  throw new Error(`Nieobsługiwany dostawca płatności: ${provider ?? "brak"}`);
}
