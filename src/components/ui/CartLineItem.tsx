"use client";

import type { CartItemDetails } from "@/lib/cart-item-details";
import { updateCartItemPatient } from "@/lib/cart-patients";
import { getPackageById } from "@/lib/packages";
import { catalogOfferHref, packageOfferHref } from "@/lib/product-href";
import type { CartItem, PatientProfile } from "@/lib/types";
import { OfferCard } from "./OfferCard";

type CartLineItemProps = {
  item: CartItem;
  details: CartItemDetails | null;
  patients: PatientProfile[];
  onRemove: (key: string) => void;
  onPatientChange?: () => void;
  hidePatientSelector?: boolean;
  assignSelectRef?: React.Ref<HTMLSelectElement>;
};

export function CartLineItem({
  item,
  details,
  patients,
  onRemove,
  onPatientChange,
  hidePatientSelector = false,
  assignSelectRef,
}: CartLineItemProps) {
  const isPackage = item.kind === "package" || item.typ === "pakiet";
  const typ: "badanie" | "pakiet" = isPackage ? "pakiet" : (item.typ ?? "badanie");
  const packageTests = isPackage ? (details?.zawiera ?? []) : [];
  const internalPackage = item.packageId ? getPackageById(item.packageId) : undefined;

  const href =
    item.kind === "package" && item.packageId
      ? packageOfferHref(item.packageId)
      : item.catalogSlug
        ? catalogOfferHref(item.catalogSlug)
        : "/";

  const testCount = packageTests.length || internalPackage?.testCount || 0;
  const resultTime = details?.czasWyniku || internalPackage?.resultTime || "";

  function handleAssignPatient(patientId: string) {
    if (!patientId || patientId === item.patientId) return;
    const ok = updateCartItemPatient(item.key, patientId);
    if (ok) onPatientChange?.();
  }

  return (
    <OfferCard
      variant="cart"
      href={href}
      name={item.name}
      typ={typ}
      price={item.price}
      resultTime={resultTime}
      testCount={testCount}
      packageId={item.packageId}
      catalogSlug={item.catalogSlug}
      catalogId={item.catalogId}
      cartLineKey={item.key}
      onRemove={onRemove}
      patients={patients}
      selectedPatientId={item.patientId}
      onAssignPatient={handleAssignPatient}
      hidePatientSelector={hidePatientSelector}
      assignSelectRef={assignSelectRef}
      packageTests={packageTests}
      packageTestsLoading={isPackage && packageTests.length === 0 && !details}
    />
  );
}
