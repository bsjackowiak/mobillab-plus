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
      <p className="hero-sub brand-page-sub">{BRAND.tagline}</p>

      <div className="brand-section">
        <h3 className="brand-section-title">Komponent React</h3>
        <div className="brand-preview-row">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
        </div>
        <div className="brand-preview-row">
          <Logo variant="vertical" size="md" />
          <LogoMark size={40} />
          <LogoMark size={56} />
        </div>
      </div>

      <div className="brand-section">
        <h3 className="brand-section-title">Kolorystyka</h3>
        <div className="brand-swatches">
          {COLORS.map((color) => (
            <div key={color.name} className="brand-swatch">
              <span className="brand-swatch-chip" style={{ background: color.value }} />
              <strong>{color.name}</strong>
              <span>{color.value}</span>
              <small>{color.note}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="brand-section">
        <h3 className="brand-section-title">Wersje logo (SVG)</h3>
        <div className="brand-logo-grid">
          {LOGO_VERSIONS.map((logo) => (
            <div
              key={logo.title}
              className={`brand-logo-card${"dark" in logo && logo.dark ? " brand-logo-card-dark" : ""}`}
            >
              <img src={logo.src} alt={logo.title} className="brand-logo-asset" />
              <span>{logo.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="why-box">
        <h3>Typografia</h3>
        <p>
          <strong>Plus Jakarta Sans</strong> — nowoczesny, premium font zoptymalizowany pod mobile.
          Wagi: 500, 600, 700, 800.
        </p>
      </div>
    </MobileShell>
  );
}
