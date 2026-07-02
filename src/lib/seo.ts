import type { Metadata } from "next";
import { getAppBaseUrl } from "@/lib/app-url";
import { BRAND } from "@/lib/brand";
import { cleanInlineMarkdown } from "@/lib/catalog-text";

const META_DESCRIPTION_MAX = 160;

export function truncateMetaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > max * 0.6) {
    return `${slice.slice(0, lastSpace).trim()}…`;
  }
  return `${slice.trim()}…`;
}

export function catalogMetaDescription(opis: string, nazwa: string): string {
  const fromOpis = cleanInlineMarkdown(opis);
  if (fromOpis.length >= 40) {
    return truncateMetaDescription(fromOpis);
  }
  return truncateMetaDescription(
    `Zamów ${nazwa} prywatnie w ${BRAND.name} — bez skierowania, szybka rezerwacja online.`,
  );
}

export function absoluteUrl(path: string): string {
  const base = getAppBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(BRAND.name) ? title : `${title} | ${BRAND.name}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: BRAND.name,
      locale: "pl_PL",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export type ProductJsonLdInput = {
  name: string;
  description: string;
  url: string;
  price: number | null;
  sku?: string;
};

export function buildProductJsonLd(input: ProductJsonLdInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: input.url,
    brand: {
      "@type": "Brand",
      name: BRAND.name,
    },
  };

  if (input.sku) {
    payload.sku = input.sku;
  }

  if (input.price != null) {
    payload.offers = {
      "@type": "Offer",
      price: input.price.toFixed(2),
      priceCurrency: "PLN",
      availability: "https://schema.org/InStock",
      url: input.url,
    };
  }

  return payload;
}

export const SITE_DEFAULT_DESCRIPTION =
  "Zamów badania laboratoryjne prywatnie, bez skierowania — na telefonie i komputerze.";
