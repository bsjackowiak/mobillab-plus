import { contactTopicLabel, type ContactTopic } from "@/lib/contact-form";
import { COMPANY } from "@/lib/company";

export type ContactEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildContactNotificationEmail(payload: ContactEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const topicLabel = contactTopicLabel(payload.topic);
  const subject = `[Mobillab+] ${topicLabel} — ${payload.name}`;
  const phoneLine = payload.phone ? `\nTelefon: ${payload.phone}` : "";

  const text = [
    "Nowe zapytanie z formularza kontaktowego",
    "",
    `Temat: ${topicLabel}`,
    `Od: ${payload.name}`,
    `E-mail: ${payload.email}${phoneLine}`,
    "",
    payload.message,
  ].join("\n");

  const html = `
  <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#1d1d1f;max-width:560px">
    <h1 style="font-size:18px;margin:0 0 12px">Nowe zapytanie kontaktowe</h1>
    <p style="margin:0 0 8px"><strong>Temat:</strong> ${escapeHtml(topicLabel)}</p>
    <p style="margin:0 0 8px"><strong>Od:</strong> ${escapeHtml(payload.name)}</p>
    <p style="margin:0 0 8px"><strong>E-mail:</strong> <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
    ${payload.phone ? `<p style="margin:0 0 8px"><strong>Telefon:</strong> ${escapeHtml(payload.phone)}</p>` : ""}
    <div style="margin:16px 0 0;padding:14px 16px;background:#f5f5f7;border-radius:12px;white-space:pre-wrap">${escapeHtml(payload.message)}</div>
  </div>`;

  return { subject, html, text };
}

export type SendContactEmailResult = { sent: boolean; reason?: string };

export async function sendContactNotificationEmail(
  payload: ContactEmailPayload,
): Promise<SendContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ??
    `${COMPANY.brandName} <noreply@${COMPANY.contactEmail.split("@")[1] ?? "mobillab.pl"}>`;
  const to = process.env.CONTACT_INBOX_EMAIL ?? COMPANY.contactEmail;

  const { subject, html, text } = buildContactNotificationEmail(payload);

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact-email] RESEND_API_KEY brak — podgląd:\n", text);
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
      to: [to],
      reply_to: payload.email,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[contact-email] Resend error:", res.status, detail);
    return { sent: false, reason: "send_failed" };
  }

  return { sent: true };
}
