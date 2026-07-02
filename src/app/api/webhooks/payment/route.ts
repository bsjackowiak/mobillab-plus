import { NextResponse } from "next/server";
import {
  handlePaymentWebhook,
  verifyPaymentWebhookSecret,
  type PaymentWebhookPayload,
} from "@/lib/server/payment-webhook";

export async function POST(request: Request) {
  if (!verifyPaymentWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PaymentWebhookPayload;
  try {
    body = (await request.json()) as PaymentWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await handlePaymentWebhook(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, emailSent: result.emailSent });
}
