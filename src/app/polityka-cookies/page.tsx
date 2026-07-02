import { sitePageLegalListClassName } from "@/components/layout/site-page-layout";
import Link from "next/link";
import { SitePage } from "@/components/layout/SitePage";
import { COMPANY, companyAddressLine, companyRegistryLine } from "@/lib/company";
import {
  CONSENT_POLICY_VERSION,
  COOKIE_CATEGORY_DESCRIPTIONS,
  COOKIE_CATEGORY_LABELS,
  COOKIE_REGISTRY,
  type CookieCategory,
} from "@/lib/cookie-consent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Polityka cookies",
  description:
    "Polityka plików cookies Mobillab+ — jakie cookies używamy i jak zarządzać zgodami.",
  path: "/polityka-cookies",
});

const CATEGORY_ORDER: CookieCategory[] = [
  "necessary",
  "functional",
  "analytics",
  "marketing",
];

export default function PolitykaCookiesPage() {
  return (
    <SitePage
      title="Polityka cookies"
      subtitle={`Wersja ${CONSENT_POLICY_VERSION} · zgodnie z ePrivacy i RODO`}
    >
      <p>
        Niniejsza polityka opisuje, jak {COMPANY.legalName} ({COMPANY.brandName}) wykorzystuje pliki
        cookies i podobne technologie. Administrator: {companyAddressLine()}. {companyRegistryLine()}.
      </p>

      <h3>Co to są cookies?</h3>
      <p>
        Cookies to małe pliki zapisywane w przeglądarce lub na serwerze, które umożliwiają
        działanie serwisu, zapamiętanie ustawień lub — za Twoją zgodą — pomiar ruchu i marketing.
      </p>

      <h3>Jak wyrażasz zgodę?</h3>
      <p>
        Przy pierwszej wizycie wyświetlamy baner z równorzędnymi opcjami:{" "}
        <strong>Odrzuć wszystkie</strong>, <strong>Dostosuj</strong> oraz{" "}
        <strong>Akceptuj wszystkie</strong>. Zamknięcie banera (×) traktujemy jako odmowę
        opcjonalnych cookies. Zgodę możesz w każdej chwili zmienić w menu → Ustawienia
        prywatności.
      </p>

      <h3>Kategorie cookies</h3>
      {CATEGORY_ORDER.map((category) => (
        <p key={category}>
          <strong>{COOKIE_CATEGORY_LABELS[category]}:</strong>{" "}
          {COOKIE_CATEGORY_DESCRIPTIONS[category]}
        </p>
      ))}

      <h3>Lista stosowanych plików</h3>
      <ul className={sitePageLegalListClassName}>
        {COOKIE_REGISTRY.map((cookie) => (
          <li key={cookie.name}>
            <strong>{cookie.name}</strong> — {COOKIE_CATEGORY_LABELS[cookie.category]},{" "}
            {cookie.duration}, {cookie.type === "http" ? "HTTP (serwer)" : "localStorage"}.
            {cookie.purpose}
          </li>
        ))}
      </ul>

      <h3>Kontakt</h3>
      <p>
        Pytania dotyczące cookies i prywatności:{" "}
        <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>.
      </p>

      <p>
        Więcej o przetwarzaniu danych osobowych:{" "}
        <Link href="/polityka-prywatnosci">Polityka prywatności</Link>.
      </p>
    </SitePage>
  );
}
