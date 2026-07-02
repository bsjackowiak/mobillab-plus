import { createHash } from "crypto";
import { getAppBaseUrl } from "@/lib/app-url";
import { splitFullName } from "@/lib/patient-onboarding";
import type { StoredOrderRecord } from "@/lib/order-registry-types";

export type PayUCreateOrderResult = {
  redirectUri: string;
  orderId: string;
};

type PayUTokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: PayUTokenCache | null = null;

function payuEnv(): "sandbox" | "production" {
  const env = process.env.PAYU_ENV?.toLowerCase();
  return env === "production" ? "production" : "sandbox";
}

export function getPayUBaseUrl(): string {
  return payuEnv() === "production" ? "https://secure.payu.com" : "https://secure.snd.payu.com";
}

function requirePayUConfig(): {
  posId: string;
  clientId: string;
  clientSecret: string;
  md5Key: string;
} {
  const posId = process.env.PAYU_POS_ID?.trim();
  const clientId = process.env.PAYU_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYU_CLIENT_SECRET?.trim();
  const md5Key = process.env.PAYU_MD5_KEY?.trim();

  if (!posId || !clientId || !clientSecret || !md5Key) {
    throw new Error("Brak konfiguracji PayU (POS_ID, CLIENT_ID, CLIENT_SECRET, MD5_KEY)");
  }

  return { posId, clientId, clientSecret, md5Key };
}

async function getPayUAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  const { clientId, clientSecret } = requirePayUConfig();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${getPayUBaseUrl()}/pl/standard/user/oauth/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? "PayU OAuth nie powiodło się");
  }

  tokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}

export function mapPayUStatus(status: string): "pending" | "paid" | "failed" | null {
  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED") return "paid";
  if (normalized === "CANCELED" || normalized === "REJECTED") return "failed";
  if (
    normalized === "PENDING" ||
    normalized === "WAITING_FOR_CONFIRMATION" ||
    normalized === "NEW"
  ) {
    return "pending";
  }
  return null;
}

export function verifyPayUSignature(rawBody: string, signatureHeader: string | null): boolean {
  const { md5Key } = requirePayUConfig();
  if (!signatureHeader) return false;

  const signatureMatch = signatureHeader.match(/signature=([^;]+)/i);
  const algorithmMatch = signatureHeader.match(/algorithm=([^;]+)/i);
  if (!signatureMatch?.[1] || algorithmMatch?.[1]?.toUpperCase() !== "MD5") {
    return false;
  }

  const incoming = signatureMatch[1].trim();
  const expected = createHash("md5").update(`${rawBody}${md5Key}`).digest("hex");
  return incoming === expected;
}

function amountInGrosze(amountPln: number): string {
  return String(Math.round(amountPln * 100));
}

export async function createPayUOrder(
  record: StoredOrderRecord,
  customerIp: string,
): Promise<PayUCreateOrderResult> {
  const { posId } = requirePayUConfig();
  const token = await getPayUAccessToken();
  const baseUrl = getAppBaseUrl();
  const contact = record.patients[0];
  const { firstName, lastName } = splitFullName(contact?.fullName ?? "Klient");

  const products = record.order.items.map((item) => ({
    name: item.name.slice(0, 255),
    unitPrice: amountInGrosze(item.price ?? 0),
    quantity: "1",
  }));

  const itemsTotal = record.order.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const feeAmount = record.grandTotal - itemsTotal;
  if (feeAmount > 0) {
    products.push({
      name: "Pobranie",
      unitPrice: amountInGrosze(feeAmount),
      quantity: "1",
    });
  }

  const payload = {
    notifyUrl: `${baseUrl}/api/webhooks/payu`,
    continueUrl: `${baseUrl}/sukces/${record.accessToken}`,
    customerIp,
    merchantPosId: posId,
    description: `Zamówienie ${record.orderNumber}`,
    currencyCode: "PLN",
    totalAmount: amountInGrosze(record.grandTotal),
    extOrderId: record.orderNumber,
    buyer: {
      email: record.contactEmail || contact?.email || "brak@mobillab.pl",
      phone: contact?.phone ?? undefined,
      firstName: firstName || "Klient",
      lastName: lastName || "Mobillab",
      language: "pl",
    },
    products,
  };

  const res = await fetch(`${getPayUBaseUrl()}/api/v2_1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    redirect: "manual",
  });

  if (res.status === 301 || res.status === 302) {
    const redirectUri = res.headers.get("location");
    if (!redirectUri) throw new Error("PayU nie zwróciło adresu przekierowania");
    return { redirectUri, orderId: record.orderNumber };
  }

  const data = (await res.json()) as {
    status?: { statusCode?: string; statusDesc?: string };
    redirectUri?: string;
    orderId?: string;
    error?: string;
    message?: string;
  };

  if (!res.ok || data.status?.statusCode === "ERROR") {
    throw new Error(
      data.status?.statusDesc ?? data.error ?? data.message ?? "PayU odrzuciło zamówienie",
    );
  }

  if (!data.redirectUri) {
    throw new Error("PayU nie zwróciło redirectUri");
  }

  return {
    redirectUri: data.redirectUri,
    orderId: data.orderId ?? record.orderNumber,
  };
}
