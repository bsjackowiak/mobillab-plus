import { sitePageLegalListClassName } from "@/components/layout/site-page-layout";
import Link from "next/link";
import { SitePage } from "@/components/layout/SitePage";
import {
  companyAddressLine,
  companyRegistryLine,
  COMPANY,
} from "@/lib/company";
import { CONSENT_POLICY_VERSION } from "@/lib/cookie-consent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Polityka prywatności",
  description: `Polityka prywatności Mobillab+ (wersja ${CONSENT_POLICY_VERSION}) — informacja RODO i przetwarzanie danych.`,
  path: "/polityka-prywatnosci",
});

export default function PolitykaPrywatnosciPage() {
  return (
    <SitePage
      title="Polityka prywatności"
      subtitle={`Wersja ${CONSENT_POLICY_VERSION} · informacja RODO`}
    >
      <p>
        Niniejsza polityka wyjaśnia, jak {COMPANY.brandName} przetwarza dane osobowe użytkowników
        serwisu internetowego służącego do zamawiania badań laboratoryjnych.
      </p>

      <h3>Administrator danych</h3>
      <p>
        Administratorem danych osobowych jest <strong>{COMPANY.legalName}</strong>,{" "}
        {companyAddressLine()}, {COMPANY.country}. {companyRegistryLine()}.
      </p>
      <p>
        Kontakt w sprawach ogólnych:{" "}
        <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>
        {COMPANY.phone ? ` · tel. ${COMPANY.phone}` : ""}.
      </p>
      <p>
        Kontakt w sprawach ochrony danych (IOD):{" "}
        <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>.
      </p>

      <h3>Jakie dane przetwarzamy?</h3>
      <p>
        W zależności od etapu korzystania z serwisu: imię i nazwisko, PESEL lub data urodzenia,
        adres e-mail, numer telefonu, dane do faktury, wybrane badania, termin i miejsce pobrania,
        identyfikator sesji technicznej oraz — za zgodą — dane z cookies opcjonalnych (analityka,
        marketing).
      </p>

      <h3>Cele i podstawy prawne</h3>
      <ul className={sitePageLegalListClassName}>
        <li>
          <strong>Realizacja zamówienia</strong> — art. 6 ust. 1 lit. b RODO (umowa) oraz lit. c
          (obowiązki prawne, np. dokumentacja medyczna).
        </li>
        <li>
          <strong>Kontakt i obsługa</strong> — art. 6 ust. 1 lit. b lub f RODO (prawnie uzasadniony
          interes: odpowiedź na zapytania).
        </li>
        <li>
          <strong>Cookies opcjonalne</strong> — art. 6 ust. 1 lit. a RODO (zgoda wyrażona w banerze).
        </li>
        <li>
          <strong>Bezpieczeństwo serwisu</strong> — art. 6 ust. 1 lit. f RODO (logi techniczne,
          zapobieganie nadużyciom).
        </li>
      </ul>

      <h3>Odbiorcy danych</h3>
      <p>
        Dane przekazujemy wyłącznie podmiotom uczestniczącym w realizacji usługi: punktom pobrań,
        laboratoriom, podmiotom obsługującym płatności (po wdrożeniu produkcyjnym), dostawcom
        hostingu i IT — na podstawie umów powierzenia przetwarzania danych.
      </p>

      <h3>Okres przechowywania</h3>
      <p>
        Dane zamówienia — przez okres wymagany przepisami o dokumentacji medycznej i rachunkowości.
        Dane kontaktowe marketingowe — do wycofania zgody. Sesja techniczna — do 90 dni nieaktywności.
        Zgoda na cookies — 12 miesięcy lub do zmiany decyzji.
      </p>

      <h3>Twoje prawa</h3>
      <p>
        Przysługuje Ci prawo dostępu, sprostowania, usunięcia, ograniczenia przetwarzania,
        przenoszenia danych, sprzeciwu (gdy podstawą jest art. 6 ust. 1 lit. f) oraz wycofania
        zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania sprzed wycofania).
      </p>
      <p>
        Skargę możesz złożyć do{" "}
        <a href={COMPANY.uodoUrl} target="_blank" rel="noopener noreferrer">
          {COMPANY.uodoName}
        </a>
        .
      </p>

      <h3>Przekazywanie poza EOG</h3>
      <p>
        Co do zasady dane przetwarzamy w Europejskim Obszarze Gospodarczym. Jeśli korzystamy z
        dostawców spoza EOG, stosujemy standardowe klauzule umowne Komisji Europejskiej lub inne
        mechanizmy z art. 46 RODO.
      </p>

      <h3>Automatyczne podejmowanie decyzji</h3>
      <p>
        Nie podejmujemy wobec Ciebie decyzji wyłącznie zautomatyzowanych, w tym profilowania, które
        wywoływałyby skutki prawne.
      </p>

      <p>
        Szczegóły technologii cookies: <Link href="/polityka-cookies">Polityka cookies</Link>.
        Ustawienia zgody zmienisz w menu → Ustawienia prywatności.
      </p>
    </SitePage>
  );
}
