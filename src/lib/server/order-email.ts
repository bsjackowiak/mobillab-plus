import { orderPublicUrl, paymentWaitingUrl } from "@/lib/app-url";
import { COMPANY } from "@/lib/company";
import { collectionSummary } from "@/lib/collection";
import { hasBillableInvoice, invoiceSummary } from "@/lib/invoice";
import type { OrderState, PatientProfile } from "@/lib/types";

export type OrderEmailPayload = {
  order: OrderState;
  patients: PatientProfile[];
  grandTotal: number;
  contactEmail: string;
  accessToken?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildOrderConfirmationEmail(payload: OrderEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const { order, patients, grandTotal, contactEmail, accessToken } = payload;
  const orderNumber = order.orderNumber ?? "—";
  const orderLink = accessToken ? orderPublicUrl(accessToken) : null;
  const visit = collectionSummary(order);
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} — ${item.price != null ? `${item.price} zł` : "—"}</li>`,
    )
    .join("");
  const patientsLine = patients.map((p) => escapeHtml(p.fullName)).join(", ");
  const invoiceLine =
    hasBillableInvoice(order.invoiceType) &&
    invoiceSummary(
      order.invoiceType,
      order.invoicePersonal ?? { fullName: "", address: "", postalCode: "", city: "" },
      order.invoiceCompany ?? {
        companyName: "",
        nip: "",
        address: "",
        postalCode: "",
        city: "",
      },
    );

  const subject = `${COMPANY.brandName} — potwierdzenie zamówienia #${orderNumber}`;

  const text = [
    `Dziękujemy za zamówienie w ${COMPANY.brandName}.`,
    ``,
    `Numer zamówienia: ${orderNumber}`,
    `Kwota: ${grandTotal} zł`,
    ``,
    `Pobranie: ${visit.title}`,
    visit.detail,
    ``,
    `Badania:`,
    ...order.items.map((i) => `- ${i.name} (${i.price ?? "—"} zł)`),
    patients.length > 0 ? `\nPacjenci: ${patients.map((p) => p.fullName).join(", ")}` : "",
    invoiceLine ? `\nFaktura: ${invoiceLine}` : "",
    orderLink ? `\nStatus zamówienia: ${orderLink}` : "",
    ``,
    `W razie pytań: ${COMPANY.contactEmail}`,
    ``,
    `${COMPANY.legalName}`,
    `${COMPANY.address}, ${COMPANY.postalCode} ${COMPANY.city}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="pl">
<body style="font-family:system-ui,sans-serif;color:#1d1d1f;line-height:1.5;max-width:520px">
  <p>Dziękujemy za zamówienie w <strong>${escapeHtml(COMPANY.brandName)}</strong>.</p>
  <p style="font-size:22px;font-weight:700">#${escapeHtml(orderNumber)}</p>
  <p><strong>Kwota:</strong> ${grandTotal} zł</p>
  <p><strong>Pobranie:</strong><br>${escapeHtml(visit.title)}<br>${escapeHtml(visit.detail)}</p>
  ${patientsLine ? `<p><strong>Pacjenci:</strong> ${patientsLine}</p>` : ""}
  <p><strong>Badania:</strong></p>
  <ul>${itemsHtml}</ul>
  ${invoiceLine ? `<p><strong>Faktura:</strong> ${escapeHtml(invoiceLine)}</p>` : ""}
  ${orderLink ? `<p><a href="${escapeHtml(orderLink)}" style="display:inline-block;margin-top:12px;padding:12px 18px;background:#0f6fff;color:#fff;text-decoration:none;border-radius:12px;font-weight:700">Zobacz zamówienie</a></p>` : ""}
  <p style="color:#6e6e73;font-size:13px">Wiadomość wysłana na ${escapeHtml(contactEmail)}. Pytania: <a href="mailto:${COMPANY.contactEmail}">${COMPANY.contactEmail}</a></p>
  <hr style="border:none;border-top:1px solid #e5e5ea;margin:24px 0">
  <p style="font-size:12px;color:#6e6e73">${escapeHtml(COMPANY.legalName)} · NIP ${COMPANY.nip}</p>
</body>
</html>`;

  return { subject, html, text };
}

export type SendEmailResult = { sent: boolean; reason?: string };

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${COMPANY.brandName} <noreply@${COMPANY.contactEmail.split("@")[1] ?? "mobillab.pl"}>`;

  const { subject, html, text } = buildOrderConfirmationEmail(payload);

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[order-email] RESEND_API_KEY brak — podgląd:\n", text);
    }
    return { sent: false, reason: "email_not_configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.contactEmail],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[order-email] Resend error:", res.status, detail);
    return { sent: false, reason: "send_failed" };
  }

  return { sent: true };
}
