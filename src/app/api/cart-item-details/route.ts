import { NextResponse } from "next/server";
import { getCatalogItemBySlug } from "@/lib/catalog";
import { formatCatalogDetails } from "@/lib/cart-item-details";
import { parsePackageComposition } from "@/lib/offer-format";

export async function POST(req: Request) {
  const body = (await req.json()) as { slugs?: string[] };
  const slugs = Array.isArray(body.slugs) ? body.slugs.filter((slug) => typeof slug === "string") : [];

  const details: Record<string, ReturnType<typeof formatCatalogDetails>> = {};

  for (const slug of slugs) {
    const item = getCatalogItemBySlug(slug);
    if (!item) continue;

    const zawiera =
      item.typ === "pakiet"
        ? parsePackageComposition(item.sklad_pakietu)
        : [item.nazwa];

    details[slug] = formatCatalogDetails(item, zawiera);
  }

  return NextResponse.json({ details });
}
