"use client";

import { btnWarmClassName } from "@/components/ui/app-button-layout";
import { chipClassName } from "@/components/ui/chip-layout";
import {
  homeChipsHomeClassName,
  homeFindClassName,
  homeHeroArtClassName,
  homeHeroClassName,
  homeHeroCopyClassName,
  homeHeroVisualClassName,
  homeSectionLabelClassName,
  homeShortcutsClassName,
  homeTrustChipClassName,
  homeTrustChipsClassName,
} from "@/components/ui/home-page-layout";
import { heroSubHomeClassName, heroTitleClassName } from "@/components/ui/page-hero-layout";
import { useRouter } from "next/navigation";
import { MedicalHeroIllustration } from "@/components/illustrations/MedicalHeroIllustration";
import { MobileShell } from "@/components/layout/MobileShell";
import { HomeRecommendedSection } from "@/components/ui/HomeRecommendedSection";
import { SearchBox } from "@/components/ui/SearchBox";
import { POPULAR_HOME_CHIPS } from "@/lib/recommended-home";

const HOME_TRUST_CHIPS = ["Bez skierowania", "Wynik online", "Pobranie w domu"] as const;

export default function HomePage() {
  const router = useRouter();

  return (
    <MobileShell home noCta>
      <section className={homeHeroClassName} aria-label="Wprowadzenie">
        <div className={homeHeroCopyClassName}>
          <h2 className={heroTitleClassName}>
            Co chcesz
            <br />
            sprawdzić?
          </h2>
          <p className={heroSubHomeClassName}>Wyszukaj badanie lub opisz objawy</p>
        </div>
        <div className={homeHeroVisualClassName}>
          <MedicalHeroIllustration className={homeHeroArtClassName} />
        </div>
      </section>

      <section className={homeFindClassName} aria-label="Wyszukiwanie i pomoc">
        <SearchBox />
        <button type="button" className={btnWarmClassName} onClick={() => router.push("/wizard")}>
          Nie wiem — pomóż mi wybrać
        </button>
      </section>

      <div className={homeTrustChipsClassName} aria-label="Zalety Mobillab+">
        {HOME_TRUST_CHIPS.map((label) => (
          <span key={label} className={homeTrustChipClassName}>
            {label}
          </span>
        ))}
      </div>

      <section className={homeShortcutsClassName} aria-label="Szybkie skróty">
        <h3 className={homeSectionLabelClassName}>Szybkie skróty</h3>
        <div className={homeChipsHomeClassName}>
          {POPULAR_HOME_CHIPS.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={chipClassName}
              onClick={() => router.push(`/oferta/${item.slug}`)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className={chipClassName} onClick={() => router.push("/kategorie")}>
            Kategorie
          </button>
        </div>
      </section>

      <HomeRecommendedSection />
    </MobileShell>
  );
}
