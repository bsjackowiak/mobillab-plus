"use client";

import { useState } from "react";
import { CatalogPageLayout } from "@/components/layout/CatalogPageLayout";
import {
  catalogFeaturedGridClassName,
  catalogSectionClassName,
  catalogSectionTitleClassName,
} from "@/components/ui/catalog-page-layout";
import { MobileShell } from "@/components/layout/MobileShell";
import { CatalogInfiniteList } from "@/components/ui/CatalogInfiniteList";
import { OfferCard, offerCardListClassName } from "@/components/ui/OfferCard";
import { searchToastClassName } from "@/components/ui/search-box-layout";
import { PACKAGES } from "@/lib/packages";
import { packageOfferHref } from "@/lib/product-href";

export default function PakietyPage() {
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <MobileShell showBack backFallback="/" noCta>
      <CatalogPageLayout
        title="Pakiety badań"
        subtitle="Gotowe zestawy badań — bez skierowania"
      >
        {toast && <p className={`${searchToastClassName} catalog-page-toast`}>{toast}</p>}

        <section className={catalogSectionClassName}>
          <h3 className={catalogSectionTitleClassName}>Polecane pakiety</h3>
          <div className={`${offerCardListClassName} ${catalogFeaturedGridClassName}`}>
            {PACKAGES.map((pkg) => (
              <OfferCard
                key={pkg.id}
                href={packageOfferHref(pkg.id)}
                name={pkg.name}
                typ="pakiet"
                price={pkg.price}
                resultTime={pkg.resultTime}
                testCount={pkg.testCount}
                packageId={pkg.id}
                onCartToast={showToast}
              />
            ))}
          </div>
        </section>

        <section className={catalogSectionClassName}>
          <h3 className={catalogSectionTitleClassName}>Wszystkie pakiety z cennika</h3>
          <CatalogInfiniteList typ="pakiet" />
        </section>
      </CatalogPageLayout>
    </MobileShell>
  );
}
