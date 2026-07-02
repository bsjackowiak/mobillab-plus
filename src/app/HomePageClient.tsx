"use client";

import dynamic from "next/dynamic";
import { btnWarmClassName } from "@/components/ui/app-button-layout";
import { chipClassName } from "@/components/ui/chip-layout";
import {
  HomeRecommendedFallback,
  HomeSearchFallback,
} from "@/components/home/home-page-fallbacks";
import {
  homeChipsHomeClassName,
  homeHeroArtClassName,
  homeHeroClassName,
  homeHeroCopyClassName,
  homeHeroVisualClassName,
  homeFindClassName,
  homeSectionLabelClassName,
  homeShortcutsClassName,
  homeTrustChipClassName,
  homeTrustChipsClassName,
} from "@/components/ui/home-page-layout";
import { heroSubHomeClassName, heroTitleClassName } from "@/components/ui/page-hero-layout";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { POPULAR_HOME_CHIPS } from "@/lib/recommended-home";

const MedicalHeroIllustration = dynamic(
  () =>
    import("@/components/illustrations/MedicalHeroIllustration").then(
      (module) => module.MedicalHeroIllustration,
    ),
  { loading: () => <div className={homeHeroArtClassName} aria-hidden="true" /> },
);

const SearchBox = dynamic(
  () => import("@/components/ui/SearchBox").then((module) => module.SearchBox),
  { loading: () => <HomeSearchFallback /> },
);

const HomeRecommendedSection = dynamic(
  () =>
    import("@/components/ui/HomeRecommendedSection").then(
      (module) => module.HomeRecommendedSection,
    ),
  { loading: () => <HomeRecommendedFallback /> },
);

const HOME_TRUST_CHIPS = ["Bez skierowania", "Wynik online", "Pobranie w domu"] as const;

export function HomePageClient() {
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
