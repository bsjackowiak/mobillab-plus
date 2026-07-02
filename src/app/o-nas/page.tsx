import { heroSubHomeClassName, heroTitleClassName } from "@/components/ui/page-hero-layout";
import {
  aboutClosingBlockClassName,
  aboutClosingClassName,
  aboutCtaBtnClassName,
  aboutCtaNoteClassName,
  aboutEmphasisClassName,
  aboutHelpActionsClassName,
  aboutHelpClassName,
  aboutHelpCopyClassName,
  aboutHelpLinkClassName,
  aboutHelpLinkWaClassName,
  aboutHeroClassName,
  aboutHeroCopyClassName,
  aboutHeroVisualClassName,
  aboutLeadClassName,
  aboutListCheckClassName,
  aboutListClassName,
  aboutMidGridClassName,
  aboutNotesClassName,
  aboutPageClassName,
  aboutPhotoClassName,
  aboutPhotoWrapClassName,
  aboutProfileBodyClassName,
  aboutProfileClassName,
  aboutProfileGreetingClassName,
  aboutSectionClassName,
  aboutSectionSubheadClassName,
  aboutSectionWideClassName,
  aboutSectionsGridClassName,
  aboutWarmNoteAccentClassName,
  aboutWarmNoteClassName,
} from "@/components/ui/about-page-layout";
import {
  homeTrustChipClassName,
  homeTrustChipsAboutClassName,
} from "@/components/ui/home-page-layout";
import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_WHATSAPP_URL,
} from "@/lib/contact";

const FOR_WHO = [
  "rodzice z dziećmi",
  "seniorzy",
  "osoby po zabiegach lub w trakcie rekonwalescencji",
  "osoby zapracowane",
  "pacjenci wykonujący regularne badania kontrolne",
  "osoby, które po prostu lepiej czują się we własnym domu",
];

const VALUES = [
  "bez kolejek",
  "bez pośpiechu",
  "bez anonimowej infolinii",
  "bez ciągle zmieniającego się personelu",
];

const COMPANY_VISIT = [
  "w siedzibie firmy",
  "w domu pracownika",
  "w modelu mieszanym",
];

const ABOUT_TRUST_CHIPS = [
  "Poznań i okolice",
  "Pobranie w domu",
  "Laboratorium Diagnostyka",
  "20+ lat doświadczenia",
] as const;

export default function ONasPage() {
  return (
    <MobileShell
      showBack
      backFallback="/"
      stickyFooter={
        <Link href="/" className={aboutCtaBtnClassName}>
          Umów się na badania
        </Link>
      }
    >
      <section className={aboutHeroClassName} aria-label="O Mobillab+">
        <div className={aboutHeroCopyClassName}>
          <h2 className={heroTitleClassName}>O Mobillab+</h2>
          <p className={heroSubHomeClassName}>
            Spokojne pobranie krwi w domu — z troską o pacjenta
          </p>
          <div className={homeTrustChipsAboutClassName} aria-label="Zalety Mobillab+">
            {ABOUT_TRUST_CHIPS.map((label) => (
              <span key={label} className={homeTrustChipClassName}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <figure className={`${aboutHeroVisualClassName} ${aboutPhotoWrapClassName}`}>
          <img
            className={aboutPhotoClassName}
            src="/about/zespol.webp"
            width={1536}
            height={1024}
            alt="Bożena Jackowiak — mobilne pobrania krwi w domu pacjenta w Poznaniu"
            decoding="async"
            fetchPriority="high"
          />
        </figure>
      </section>

      <div className={aboutPageClassName}>
        <p className={aboutLeadClassName}>
          Mobillab+ to lokalna usługa mobilnych pobrań krwi w Poznaniu i okolicach. Powstała z
          myślą o osobach, które chcą wykonać badania wygodnie, bez kolejek i bez niepotrzebnego
          stresu.
        </p>

        <div className={aboutMidGridClassName}>
          <section className={aboutProfileClassName} aria-label="Bożena Jackowiak">
            <div className={aboutProfileBodyClassName}>
              <p className={aboutProfileGreetingClassName}>Dzień dobry, jestem Bożena</p>
              <p>
                Nazywam się <strong>Bożena Jackowiak</strong>. Od ponad 20 lat wykonuję pobrania
                krwi u dzieci, dorosłych i seniorów.
              </p>
              <p>
                To ja przyjeżdżam do pacjentów, wykonuję pobranie oraz odpowiadam na wiadomości i
                telefony. Dzięki temu od początku wiesz, z kim rozmawiasz i kto pojawi się u Ciebie
                w domu.
              </p>
            </div>
          </section>

          <div className={aboutNotesClassName}>
            <p className={aboutWarmNoteClassName}>
              Każdą wizytę staram się przeprowadzać spokojnie, delikatnie i bez pośpiechu. Wiem, że
              dla wielu osób pobranie krwi może być stresujące — szczególnie dla dzieci, seniorów
              oraz osób, które źle znoszą badania.
            </p>

            <p className={aboutWarmNoteAccentClassName}>
              Dlatego zależy mi, aby pacjent czuł się bezpiecznie i komfortowo od pierwszego kontaktu
              aż do zakończenia wizyty.
            </p>
          </div>
        </div>

        <div className={aboutSectionsGridClassName}>
          <section className={aboutSectionClassName}>
            <h3>Lokalnie i rodzinnie</h3>
            <p>Mobillab+ tworzymy rodzinnie w Poznaniu.</p>
            <p>
              Mój mąż na co dzień pracuje w laboratorium Diagnostyka i bardzo dobrze zna temat badań
              laboratoryjnych. Odpowiada także za stronę internetową oraz rozwiązania techniczne,
              dzięki którym zamówienie wizyty jest proste, szybkie i wygodne.
            </p>
            <p>Od początku zależało nam, aby stworzyć usługę, z której sami chcielibyśmy korzystać:</p>
            <ul className={aboutListCheckClassName}>
              {VALUES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Dla wielu pacjentów najważniejsze jest po prostu poczucie spokoju i zaufania.
              Możliwość rozmowy z jedną osobą. Pewność, kto przyjedzie. Przyjazna atmosfera i brak
              nerwowego pośpiechu.
            </p>
            <p className={aboutEmphasisClassName}>Właśnie dlatego Mobillab+ działa lokalnie i osobiście.</p>
          </section>

          <section className={aboutSectionClassName}>
            <h3>Bezpiecznie i profesjonalnie</h3>
            <p>
              Podczas wizyty dbam nie tylko o samo pobranie, ale także o komfort pacjenta, higienę
              oraz spokojny przebieg spotkania.
            </p>
            <p>
              Korzystam wyłącznie z jednorazowego sprzętu i sterylnych materiałów. Próbki trafiają do
              laboratorium Diagnostyka, a wyniki badań są dostępne online w panelu pacjenta.
            </p>

            <h3 className={aboutSectionSubheadClassName}>Dla kogo jest Mobillab+?</h3>
            <p>Z naszych usług korzystają między innymi:</p>
            <ul className={aboutListClassName}>
              {FOR_WHO.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Podczas jednej wizyty mogę pobrać krew kilku osobom pod tym samym adresem. To wygodne
              rozwiązanie dla całej rodziny — bez dodatkowych dojazdów i bez konieczności umawiania
              kilku osobnych wizyt.
            </p>
          </section>

          <section className={aboutSectionWideClassName}>
            <h3>Pobrania także dla firm</h3>
            <p>Organizujemy również pobrania krwi dla pracowników firm i biur.</p>
            <p>Wizyty mogą odbywać się:</p>
            <ul className={aboutListClassName}>
              {COMPANY_VISIT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Szczegóły ustalamy indywidualnie, tak aby rozwiązanie było wygodne zarówno dla
              pracodawcy, jak i dla pracowników.
            </p>
          </section>
        </div>

        <section className={aboutHelpClassName}>
          <div className={aboutHelpCopyClassName}>
            <h3>Potrzebujesz pomocy?</h3>
            <p>
              Jeżeli nie wiesz, jakie badania wybrać, zadzwoń lub napisz wiadomość. Spokojnie
              odpowiem na pytania i pomogę ustalić dogodny termin wizyty.
            </p>
          </div>
          <div className={aboutHelpActionsClassName}>
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className={aboutHelpLinkClassName}>
              Zadzwoń · {SUPPORT_PHONE_DISPLAY}
            </a>
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={aboutHelpLinkWaClassName}
            >
              Napisz na WhatsApp
            </a>
          </div>
        </section>

        <div className={aboutClosingBlockClassName}>
          <p className={aboutClosingClassName}>
            Chcemy, aby badania krwi były po prostu wygodniejsze, spokojniejsze i mniej stresujące.
          </p>
          <p className={aboutCtaNoteClassName}>
            Jeżeli zależy Ci na spokojnym pobraniu krwi w domu, jesteś w dobrym miejscu.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
