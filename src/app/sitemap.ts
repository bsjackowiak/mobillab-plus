import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-url";
import { loadCatalogItems } from "@/lib/catalog";
import { PACKAGES } from "@/lib/packages";

const STATIC_PATHS = [
  "/",
  "/badania",
  "/pakiety",
  "/kategorie",
  "/wizard",
  "/kontakt",
  "/o-nas",
  "/regulamin",
  "/polityka-prywatnosci",
  "/polityka-cookies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppBaseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const catalogEntries: MetadataRoute.Sitemap = loadCatalogItems().map((item) => ({
    url: `${base}/oferta/${item.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: item.typ === "pakiet" ? 0.8 : 0.6,
  }));

  const packageSlugs = new Set(loadCatalogItems().map((item) => item.slug));
  const packageEntries: MetadataRoute.Sitemap = PACKAGES.filter((pkg) => !packageSlugs.has(pkg.slug)).map(
    (pkg) => ({
      url: `${base}/oferta/${pkg.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...catalogEntries, ...packageEntries];
}
