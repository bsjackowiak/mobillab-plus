"use client";

import { useEffect, useState } from "react";
import { getPackageById, RECOMMENDED_TIERS } from "@/lib/packages";
import { packageOfferHref } from "@/lib/product-href";
import { isMultiPersonOrder } from "@/lib/cart-patients";
import { OfferCard, offerCardListClassName } from "@/components/ui/OfferCard";
import { cartToastClassName } from "@/components/ui/cart-toast-layout";
import { heroSubClassName } from "@/components/ui/page-hero-layout";
import {
  recommendedCatalogMoreClassName,
  recommendedCatalogMoreLabelClassName,
  recommendedPackagesClassName,
  recommendedPackagesEmbeddedClassName,
  recommendedPackagesHeaderClassName,
  recommendedPackagesSubClassName,
  recommendedPackagesTitleClassName,
} from "@/components/ui/recommended-packages-layout";
import { RecommendedReorderInfinite } from "./RecommendedReorderInfinite";

type RecommendedTiersProps = {
  requireMultiPerson?: boolean;
  hideHeader?: boolean;
};

export function RecommendedTiers({
  requireMultiPerson = false,
  hideHeader = false,
}: RecommendedTiersProps) {
  const [toast, setToast] = useState("");
  const [multiPerson, setMultiPerson] = useState(false);

  useEffect(() => {
    const refresh = () => setMultiPerson(isMultiPersonOrder());
    refresh();
    window.addEventListener("labflow-cart", refresh);
    window.addEventListener("labflow-patients", refresh);
    return () => {
      window.removeEventListener("labflow-cart", refresh);
      window.removeEventListener("labflow-patients", refresh);
    };
  }, []);

  if (requireMultiPerson && !multiPerson) return null;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <section
      className={hideHeader ? recommendedPackagesEmbeddedClassName : recommendedPackagesClassName}
      aria-label="Polecane pakiety dla każdego"
    >
      {!hideHeader && (
        <div className={recommendedPackagesHeaderClassName}>
          <h3 className={recommendedPackagesTitleClassName}>Polecane pakiety dla każdego</h3>
          {requireMultiPerson && (
            <p className={`${recommendedPackagesSubClassName} ${heroSubClassName}`}>
              Dodaj ten sam pakiet dla kolejnych osób — przy jednej wizycie pobraniowej
            </p>
          )}
        </div>
      )}

      {hideHeader && requireMultiPerson && (
        <p className={`${recommendedPackagesSubClassName} ${heroSubClassName}`}>
          Dodaj ten sam pakiet dla kolejnych osób — przy jednej wizycie pobraniowej
        </p>
      )}

      {toast && <p className={cartToastClassName}>{toast}</p>}

      <div className={offerCardListClassName}>
        {RECOMMENDED_TIERS.map((entry) => {
          const pkg = getPackageById(entry.packageId);
          if (!pkg) return null;

          return (
            <OfferCard
              key={entry.tier}
              href={packageOfferHref(pkg.id)}
              name={pkg.name}
              tierLabel={entry.label}
              typ="pakiet"
              price={pkg.price}
              resultTime={pkg.resultTime}
              testCount={pkg.testCount}
              packageId={pkg.id}
              onCartToast={showToast}
            />
          );
        })}
      </div>

      {hideHeader && (
        <div className={recommendedCatalogMoreClassName}>
          <p className={recommendedCatalogMoreLabelClassName}>Więcej z cennika</p>
          <RecommendedReorderInfinite typ="pakiet" onToast={showToast} />
        </div>
      )}
    </section>
  );
}
