import { NextResponse } from "next/server";
import { mapPayUStatus, verifyPayUSignature } from "@/lib/server/payment-providers/payu";
import { handlePaymentWebhook } from "@/lib/server/payment-webhook";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("openpayu-signature");

  if (!verifyPayUSignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    order?: {
      extOrderId?: string;
      orderId?: string;
      status?: string;
    };
  };

  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderNumber = payload.order?.extOrderId;
  const payuStatus = payload.order?.status;
  if (!orderNumber || !payuStatus) {
    return NextResponse.json({ error: "Missing order data" }, { status: 400 });
  }

  const status = mapPayUStatus(payuStatus);
  if (!status) {
    return NextResponse.json({ ok: true, ignored: payuStatus });
  }

  const result = await handlePaymentWebhook({
    orderNumber,
    status,
    externalId: payload.order?.orderId,
    provider: "payu",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Webhook failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, emailSent: result.emailSent });
}
