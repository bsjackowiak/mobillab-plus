import { notFound } from "next/navigation";
import { getCatalogItemBySlug, toCatalogSummary } from "@/lib/catalog";
import { getPackageBySlug } from "@/lib/packages";
import { OfertaClient } from "./OfertaClient";
import { PackageOfertaClient } from "./PackageOfertaClient";

type Props = { params: Promise<{ slug: string }> };

export default async function OfertaPage({ params }: Props) {
  const { slug } = await params;
  const catalogItem = getCatalogItemBySlug(slug);
  if (catalogItem) {
    return <OfertaClient item={toCatalogSummary(catalogItem)} />;
  }

  const labPackage = getPackageBySlug(slug);
  if (labPackage) {
    return <PackageOfertaClient pkg={labPackage} />;
  }

  notFound();
}
