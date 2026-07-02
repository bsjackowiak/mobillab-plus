import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogItemBySlug, getCatalogPrice, toCatalogSummary } from "@/lib/catalog";
import { getPackageBySlug } from "@/lib/packages";
import {
  absoluteUrl,
  catalogMetaDescription,
  createPageMetadata,
} from "@/lib/seo";
import { OfertaClient } from "./OfertaClient";
import { OfertaJsonLd } from "./OfertaJsonLd";
import { PackageOfertaClient } from "./PackageOfertaClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = `/oferta/${slug}`;

  const catalogItem = getCatalogItemBySlug(slug);
  if (catalogItem) {
    const description = catalogMetaDescription(catalogItem.opis, catalogItem.nazwa);
    return createPageMetadata({
      title: catalogItem.nazwa,
      description,
      path,
    });
  }

  const labPackage = getPackageBySlug(slug);
  if (labPackage) {
    return createPageMetadata({
      title: labPackage.name,
      description: catalogMetaDescription(labPackage.why, labPackage.name),
      path,
    });
  }

  return { title: "Nie znaleziono" };
}

export default async function OfertaPage({ params }: Props) {
  const { slug } = await params;
  const url = absoluteUrl(`/oferta/${slug}`);

  const catalogItem = getCatalogItemBySlug(slug);
  if (catalogItem) {
    const summary = toCatalogSummary(catalogItem);
    const description = catalogMetaDescription(catalogItem.opis, catalogItem.nazwa);
    return (
      <>
        <OfertaJsonLd
          data={{
            name: catalogItem.nazwa,
            description,
            url,
            price: getCatalogPrice(catalogItem),
            sku: catalogItem.kod_elab || catalogItem.slug,
          }}
        />
        <OfertaClient item={summary} />
      </>
    );
  }

  const labPackage = getPackageBySlug(slug);
  if (labPackage) {
    const description = catalogMetaDescription(labPackage.why, labPackage.name);
    return (
      <>
        <OfertaJsonLd
          data={{
            name: labPackage.name,
            description,
            url,
            price: labPackage.price,
            sku: labPackage.id,
          }}
        />
        <PackageOfertaClient pkg={labPackage} />
      </>
    );
  }

  notFound();
}
