import { notFound } from "next/navigation";
import { getCatalogItemBySlug, toCatalogSummary } from "@/lib/catalog";
import { OfertaClient } from "./OfertaClient";

type Props = { params: Promise<{ slug: string }> };

export default async function OfertaPage({ params }: Props) {
  const { slug } = await params;
  const item = getCatalogItemBySlug(slug);
  if (!item) notFound();
  return <OfertaClient item={toCatalogSummary(item)} />;
}
