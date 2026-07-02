"use client";

import { heroTitleSmClassName } from "@/components/ui/page-hero-layout";
import { contentBoxClassName } from "@/components/ui/content-box-layout";
import {
  metaItemClassName,
  metaRowClassName,
  ofertaDetailClassName,
  priceBigClassName,
  priceNoteClassName,
  productBadgeClassName,
} from "@/components/ui/oferta-detail-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { CartActions } from "@/components/ui/CartActions";
import { cartToastClassName } from "@/components/ui/cart-toast-layout";
import { CatalogProse, CatalogProseList } from "@/components/ui/CatalogProse";
import { getCartCount, getCartTotal } from "@/lib/cart";
import { formatAddFeedback } from "@/lib/add-to-cart";
import { goToCart } from "@/lib/checkout-flow";
import { formatResultTimeValue } from "@/lib/offer-format";
import type { LabPackage } from "@/lib/types";
import { useAddToCart } from "@/lib/use-add-to-cart";

export function PackageOfertaClient({ pkg }: { pkg: LabPackage }) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState<number | null>(null);
  const [addedMsg, setAddedMsg] = useState("");
  const { requestAdd } = useAddToCart({
    onResult: (result) => {
      const feedback = formatAddFeedback(result);
      if (feedback) setAddedMsg(feedback);
      setCartCount(getCartCount());
      setCartTotal(getCartTotal());
    },
  });

  useEffect(() => {
    const refresh = () => {
      setCartCount(getCartCount());
      setCartTotal(getCartTotal());
    };
    refresh();
    window.addEventListener("labflow-cart", refresh);
    return () => window.removeEventListener("labflow-cart", refresh);
  }, []);

  function handleAdd() {
    requestAdd({ kind: "package", packageId: pkg.id });
  }

  const resultValue = formatResultTimeValue(pkg.resultTime);

  return (
    <MobileShell
      showBack
      backFallback="/"
      stickyFooter={
        <CartActions
          onAdd={handleAdd}
          onOpenCart={() => goToCart(router)}
          cartCount={cartCount}
          cartTotal={cartTotal}
        />
      }
    >
      {addedMsg && <p className={cartToastClassName}>{addedMsg}</p>}
      <div className={ofertaDetailClassName}>
      <span className={productBadgeClassName}>Pakiet</span>
      {pkg.badge && <span className={productBadgeClassName}>{pkg.badge}</span>}
      <h2 className={heroTitleSmClassName}>{pkg.name}</h2>

      <div className={priceBigClassName}>{pkg.price} zł</div>
      <p className={priceNoteClassName}>Cena all-in · pobranie + wynik online</p>

      <div className={metaRowClassName}>
        <div className={metaItemClassName}>
          <strong>{resultValue}</strong>
          <span>na wynik</span>
        </div>
        <div className={metaItemClassName}>
          <strong>{pkg.testCount} badań</strong>
          <span>w pakiecie</span>
        </div>
        <div className={metaItemClassName}>
          <strong>Bez</strong>
          <span>skierowania</span>
        </div>
      </div>

      <div className={contentBoxClassName}>
        <h3>Dlaczego ten pakiet?</h3>
        <CatalogProse text={pkg.why} />
      </div>

      <div className={contentBoxClassName}>
        <h3>Co zawiera</h3>
        <CatalogProseList items={pkg.tests} />
      </div>
      </div>
    </MobileShell>
  );
}
