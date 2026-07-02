import { NextResponse } from "next/server";
import {
  CONTACT_MAX_FORM_AGE_MS,
  CONTACT_MIN_SUBMIT_MS,
  validateContactForm,
  type ContactFormInput,
} from "@/lib/contact-form";
import { sendContactNotificationEmail } from "@/lib/server/contact-email";
import { checkContactRateLimit, clientKeyFromRequest } from "@/lib/server/contact-rate-limit";

function sanitizePayload(body: ContactFormInput) {
  return {
    name: body.name.trim().slice(0, 200),
    email: body.email.trim().toLowerCase().slice(0, 254),
    phone: body.phone?.trim().slice(0, 24) || undefined,
    topic: body.topic,
    message: body.message.trim().slice(0, 2000),
    consent: Boolean(body.consent),
    formOpenedAt: Number(body.formOpenedAt),
    companyWebsite: typeof body.companyWebsite === "string" ? body.companyWebsite : "",
  };
}

export async function POST(request: Request) {
  const rate = checkContactRateLimit(clientKeyFromRequest(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Zbyt wiele wiadomości. Spróbuj ponownie za chwilę." },
      {
        status: 429,
        headers: rate.retryAfterSec ? { "Retry-After": String(rate.retryAfterSec) } : undefined,
      },
    );
  }

  let body: ContactFormInput;
  try {
    body = (await request.json()) as ContactFormInput;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane formularza." }, { status: 400 });
  }

  if (body.companyWebsite?.trim()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const payload = sanitizePayload(body);
  const now = Date.now();
  const formAge = now - payload.formOpenedAt;

  if (!Number.isFinite(payload.formOpenedAt) || formAge < CONTACT_MIN_SUBMIT_MS) {
    return NextResponse.json({ error: "Sprawdź formularz i spróbuj ponownie." }, { status: 400 });
  }

  if (formAge > CONTACT_MAX_FORM_AGE_MS) {
    return NextResponse.json(
      { error: "Formularz wygasł. Odśwież stronę i wyślij wiadomość ponownie." },
      { status: 400 },
    );
  }

  const fieldErrors = validateContactForm(payload);
  const errorMessages = Object.values(fieldErrors);
  if (errorMessages.length > 0) {
    return NextResponse.json({ error: errorMessages[0], fieldErrors }, { status: 400 });
  }

  const emailResult = await sendContactNotificationEmail({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    topic: payload.topic,
    message: payload.message,
  });

  if (!emailResult.sent && emailResult.reason === "send_failed") {
    return NextResponse.json(
      { error: "Nie udało się wysłać wiadomości. Spróbuj za chwilę lub zadzwoń do nas." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    emailQueued: emailResult.sent,
    demo: emailResult.reason === "email_not_configured",
  });
}
