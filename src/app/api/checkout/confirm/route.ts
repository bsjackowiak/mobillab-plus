import { NextResponse } from "next/server";
import { normalizeNip } from "@/lib/invoice";
import {
  getPaymentMode,
  getPaymentProvider,
  isLivePaymentConfigured,
} from "@/lib/payment-config";
import type { CompletedOrder } from "@/lib/session-types";
import {
  computeServerGrandTotal,
  generateServerOrderNumber,
  validateCheckoutConfirm,
  type ConfirmCheckoutBody,
} from "@/lib/server/checkout-validate";
import {
  createStoredOrder,
  markOrderEmailSent,
  updateOrderPaymentStatus,
} from "@/lib/server/order-registry";
import { sendOrderConfirmationEmail } from "@/lib/server/order-email";
import { createPaymentSession } from "@/lib/server/payment-providers";
import {
  getOrCreateSessionId,
  sessionCookieOptions,
} from "@/lib/server/session-cookie";
import { readSession, writeSession } from "@/lib/server/session-store";
import { getRequiredPatientCount } from "@/lib/patient-storage";

function withSessionCookie<T>(response: NextResponse<T>, sessionId: string, isNew: boolean) {
  if (isNew) {
    response.cookies.set(sessionCookieOptions(sessionId));
  }
  return response;
}

function getCustomerIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(request: Request) {
  const { sessionId, isNew } = await getOrCreateSessionId();
  const paymentMode = getPaymentMode();

  if (paymentMode === "live" && !isLivePaymentConfigured()) {
    return withSessionCookie(
      NextResponse.json(
        {
          error:
            "Płatności na żywo nie są skonfigurowane. Ustaw PAYMENT_PROVIDER i klucze PSP w środowisku.",
        },
        { status: 503 },
      ),
      sessionId,
      isNew,
    );
  }

  let body: ConfirmCheckoutBody;
  try {
    body = (await request.json()) as ConfirmCheckoutBody;
  } catch {
    return withSessionCookie(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
      sessionId,
      isNew,
    );
  }

  const session = await readSession(sessionId);
  const order = session.order;

  const validationError = validateCheckoutConfirm(order, session.patients, body, {
    paymentMode,
    demoAckRequired: paymentMode === "demo",
  });
  if (validationError) {
    return withSessionCookie(
      NextResponse.json({ error: validationError }, { status: 400 }),
      sessionId,
      isNew,
    );
  }

  const grandTotal = computeServerGrandTotal(order)!;
  const orderNumber = generateServerOrderNumber();
  const paymentStatus = paymentMode === "demo" ? ("demo" as const) : ("pending" as const);

  const confirmedOrder = {
    ...order,
    orderNumber,
    location: body.location,
    invoiceType: body.invoiceType,
    invoicePersonal: body.invoiceType === "personal" ? body.invoicePersonal : undefined,
    invoiceCompany:
      body.invoiceType === "company" && body.invoiceCompany
        ? { ...body.invoiceCompany, nip: normalizeNip(body.invoiceCompany.nip) }
        : undefined,
    paymentStatus,
  };

  const contact = session.patients[0];
  const patientsForOrder = session.patients.slice(0, getRequiredPatientCount(confirmedOrder));

  const stored = await createStoredOrder({
    order: confirmedOrder,
    patients: patientsForOrder,
    grandTotal,
    contactEmail: contact?.email ?? "",
    paymentStatus,
    paymentProvider: paymentMode === "live" ? (getPaymentProvider() ?? undefined) : undefined,
  });

  let emailSent = false;
  let emailWarning: string | undefined;

  if (paymentMode === "demo" && contact?.email) {
    const emailResult = await sendOrderConfirmationEmail({
      order: confirmedOrder,
      patients: patientsForOrder,
      grandTotal,
      contactEmail: contact.email,
      accessToken: stored.accessToken,
    });
    emailSent = emailResult.sent;
    if (emailResult.sent) {
      await markOrderEmailSent(orderNumber);
    } else {
      emailWarning =
        "Nie udało się wysłać e-maila — sprawdź skrzynkę później lub skontaktuj się z nami.";
    }
  }

  const archived: CompletedOrder = {
    ...confirmedOrder,
    completedAt: new Date().toISOString(),
  };

  await writeSession(sessionId, {
    ...session,
    order: confirmedOrder,
    completedOrders: [archived, ...session.completedOrders].slice(0, 50),
    updatedAt: new Date().toISOString(),
  });

  const responseBody: Record<string, unknown> = {
    ok: true,
    order: confirmedOrder,
    grandTotal,
    paymentMode,
    accessToken: stored.accessToken,
    orderUrl: `/zamowienie/${stored.accessToken}`,
    emailSent,
    emailWarning,
  };

  if (paymentMode === "live") {
    try {
      const session = await createPaymentSession(stored, getCustomerIp(request));
      await updateOrderPaymentStatus(orderNumber, "pending", {
        paymentExternalId: session.externalId,
        paymentProvider: session.provider,
        paymentRedirectUrl: session.redirectUri,
      });
      responseBody.redirectUrl = session.redirectUri;
      responseBody.paymentPending = true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się utworzyć płatności PayU";
      return withSessionCookie(
        NextResponse.json({ error: message }, { status: 502 }),
        sessionId,
        isNew,
      );
    }
  }

  return withSessionCookie(NextResponse.json(responseBody), sessionId, isNew);
}
