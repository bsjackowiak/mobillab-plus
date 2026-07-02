import { heroSubHomeClassName, heroTitleClassName } from "@/components/ui/page-hero-layout";
import {
  homeTrustChipClassName,
  homeTrustChipsContactClassName,
} from "@/components/ui/home-page-layout";
import {
  contactAsideClassName,
  contactAsideLeadClassName,
  contactAsideNoteClassName,
  contactFormCardClassName,
  contactHeroClassName,
  contactHeroCopyClassName,
  contactLayoutClassName,
  contactPageClassName,
  contactQuickActionsClassName,
  contactQuickBtnClassName,
  contactQuickBtnWaClassName,
  contactQuickLabelClassName,
  contactQuickValueClassName,
  contactSiteCardClassName,
} from "@/components/contact/contact-page-layout";
import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";
import { ContactForm } from "@/components/contact/ContactForm";
import { COMPANY, companyAddressLine } from "@/lib/company";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Kontakt",
  description:
    "Skontaktuj się z Mobillab+ — pytania o badania, zamówienia i pobrania. Formularz, e-mail i telefon.",
  path: "/kontakt",
});
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_WHATSAPP_URL,
} from "@/lib/contact";

const CONTACT_TRUST_CHIPS = [
  "Odpowiedź w 1 dzień roboczy",
  "Bezpieczne przesyłanie",
  "RODO",
] as const;

export default function KontaktPage() {
  return (
    <MobileShell showBack backFallback="/">
      <section className={contactHeroClassName} aria-label="Kontakt z Mobillab+">
        <div className={contactHeroCopyClassName}>
          <h2 className={heroTitleClassName}>Kontakt</h2>
          <p className={heroSubHomeClassName}>
            Masz pytanie o badania lub pobranie w domu? Napisz — chętnie pomożemy.
          </p>
          <div className={homeTrustChipsContactClassName} aria-label="Zalety formularza">
            {CONTACT_TRUST_CHIPS.map((label) => (
              <span key={label} className={homeTrustChipClassName}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className={contactPageClassName}>
        <div className={contactLayoutClassName}>
          <div className={contactFormCardClassName}>
            <ContactForm />
          </div>

          <aside className={contactAsideClassName} aria-label="Dane kontaktowe">
            <div className={contactSiteCardClassName}>
              <p className={contactAsideLeadClassName}>
                Wolisz zadzwonić? Jesteśmy dostępni w godzinach pracy.
              </p>

              <div className={contactQuickActionsClassName}>
                <a className={contactQuickBtnClassName} href={`tel:${SUPPORT_PHONE_TEL}`}>
                  <span className={contactQuickLabelClassName}>Zadzwoń</span>
                  <span className={contactQuickValueClassName}>{SUPPORT_PHONE_DISPLAY}</span>
                </a>
                <a
                  className={contactQuickBtnWaClassName}
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={contactQuickLabelClassName}>WhatsApp</span>
                  <span className={contactQuickValueClassName}>Napisz teraz</span>
                </a>
              </div>

              <p>
                <strong>{COMPANY.legalName}</strong>
                <br />
                {companyAddressLine()}
              </p>
              <p>
                <strong>E-mail</strong>
                <br />
                <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>
              </p>
              <p>
                <strong>IOD (prywatność)</strong>
                <br />
                <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>
              </p>
              <p>
                <strong>Godziny</strong>
                <br />
                Pon–Pt, 8:00–18:00
              </p>
            </div>

            <p className={contactAsideNoteClassName}>
              Szczegóły przetwarzania danych:{" "}
              <Link href="/polityka-prywatnosci">polityka prywatności</Link>.
            </p>
          </aside>
        </div>
      </div>
    </MobileShell>
  );
}
