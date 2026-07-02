import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/server/order-registry";

const TOKEN_RE = /^[a-f0-9-]{36}$/i;

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ error: "Nieprawidłowy link" }, { status: 400 });
  }

  const record = await getOrderByToken(token);
  if (!record) {
    return NextResponse.json({ error: "Nie znaleziono zamówienia" }, { status: 404 });
  }

  if (record.paymentStatus === "paid" || record.paymentStatus === "demo") {
    return NextResponse.json({ status: record.paymentStatus, redirectUrl: null });
  }

  if (!record.paymentRedirectUrl) {
    return NextResponse.json({ error: "Brak sesji płatności" }, { status: 404 });
  }

  return NextResponse.json({
    status: record.paymentStatus,
    redirectUrl: record.paymentRedirectUrl,
  });
}
