import { contentBoxClassName } from "@/components/ui/content-box-layout";
import { heroSubClassName } from "@/components/ui/page-hero-layout";
import {
  brandLogoAssetClassName,
  brandLogoCardClassName,
  brandLogoCardDarkClassName,
  brandLogoGridClassName,
  brandPageSubClassName,
  brandPreviewRowClassName,
  brandSectionClassName,
  brandSectionTitleClassName,
  brandSwatchChipClassName,
  brandSwatchClassName,
  brandSwatchesClassName,
} from "@/components/brand/brand-page-layout";
import { MobileShell } from "@/components/layout/MobileShell";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

const LOGO_VERSIONS = [
  { title: "Pozioma", src: "/brand/logo-horizontal.svg" },
  { title: "Pionowa", src: "/brand/logo-vertical.svg" },
  { title: "Znak +", src: "/brand/logo-mark.svg" },
  { title: "Monochromatyczna", src: "/brand/logo-mono.svg" },
  { title: "Biała", src: "/brand/logo-white.svg", dark: true },
  { title: "Czarna", src: "/brand/logo-black.svg" },
] as const;

const COLORS = [
  { name: "Primary Blue", value: BRAND.colors.blue, note: "Zaufanie, medycyna, AI" },
  { name: "Accent Orange", value: BRAND.colors.orange, note: "Energia, zdrowie, działanie" },
  { name: "Blue Soft", value: BRAND.colors.blueSoft, note: "Tła, stany aktywne" },
  { name: "Orange Soft", value: BRAND.colors.orangeSoft, note: "Podświetlenia CTA" },
] as const;

export default function BrandPage() {
  return (
    <MobileShell showBack backFallback="/" noCta>
      <Logo size="lg" />
      <p className={`${heroSubClassName} ${brandPageSubClassName}`}>{BRAND.tagline}</p>

      <div className={brandSectionClassName}>
        <h3 className={brandSectionTitleClassName}>Komponent React</h3>
        <div className={brandPreviewRowClassName}>
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
        </div>
        <div className={brandPreviewRowClassName}>
          <Logo variant="vertical" size="md" />
          <LogoMark size={40} />
          <LogoMark size={56} />
        </div>
      </div>

      <div className={brandSectionClassName}>
        <h3 className={brandSectionTitleClassName}>Kolorystyka</h3>
        <div className={brandSwatchesClassName}>
          {COLORS.map((color) => (
            <div key={color.name} className={brandSwatchClassName}>
              <span className={brandSwatchChipClassName} style={{ background: color.value }} />
              <strong>{color.name}</strong>
              <span>{color.value}</span>
              <small>{color.note}</small>
            </div>
          ))}
        </div>
      </div>

      <div className={brandSectionClassName}>
        <h3 className={brandSectionTitleClassName}>Wersje logo (SVG)</h3>
        <div className={brandLogoGridClassName}>
          {LOGO_VERSIONS.map((logo) => (
            <div
              key={logo.title}
              className={"dark" in logo && logo.dark ? brandLogoCardDarkClassName : brandLogoCardClassName}
            >
              <img src={logo.src} alt={logo.title} className={brandLogoAssetClassName} />
              <span>{logo.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={contentBoxClassName}>
        <h3>Typografia</h3>
        <p>
          <strong>Plus Jakarta Sans</strong> — nowoczesny, premium font zoptymalizowany pod mobile.
          Wagi: 500, 600, 700, 800.
        </p>
      </div>
    </MobileShell>
  );
}
