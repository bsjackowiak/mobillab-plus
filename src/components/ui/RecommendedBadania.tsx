"use client";

import { useState } from "react";
import { cartToastClassName } from "@/components/ui/cart-toast-layout";
import {
  recommendedPackagesClassName,
  recommendedPackagesEmbeddedClassName,
  recommendedPackagesHeaderClassName,
  recommendedPackagesTitleClassName,
} from "@/components/ui/recommended-packages-layout";
import { RecommendedReorderInfinite } from "@/components/ui/RecommendedReorderInfinite";

type RecommendedBadaniaProps = {
  hideHeader?: boolean;
};

export function RecommendedBadania({ hideHeader = false }: RecommendedBadaniaProps) {
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <section
      className={hideHeader ? recommendedPackagesEmbeddedClassName : recommendedPackagesClassName}
      aria-label="Polecane badania"
    >
      {!hideHeader && (
        <div className={recommendedPackagesHeaderClassName}>
          <h3 className={recommendedPackagesTitleClassName}>Polecane badania</h3>
        </div>
      )}

      {toast && <p className={cartToastClassName}>{toast}</p>}

      <RecommendedReorderInfinite typ="badanie" onToast={showToast} />
    </section>
  );
}
