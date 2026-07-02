import { getPackageById } from "./packages";

/** Strona oferty z cennika Diagnostyki. */
export function catalogOfferHref(slug: string): string {
  return `/oferta/${slug}`;
}

/** Strona oferty pakietu LabFlow (slug z packages.ts). */
export function packageOfferHref(packageId: string): string {
  const pkg = getPackageById(packageId);
  return pkg ? catalogOfferHref(pkg.slug) : catalogOfferHref(packageId);
}
