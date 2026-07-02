import { notFound, redirect } from "next/navigation";
import { getPackageById } from "@/lib/packages";
import { packageOfferHref } from "@/lib/product-href";

type Props = { params: Promise<{ id: string }> };

/** Stary URL — przekierowanie na ujednoliconą stronę oferty. */
export default async function ProductRedirectPage({ params }: Props) {
  const { id } = await params;
  const pkg = getPackageById(id);
  if (!pkg) notFound();
  redirect(packageOfferHref(id));
}
