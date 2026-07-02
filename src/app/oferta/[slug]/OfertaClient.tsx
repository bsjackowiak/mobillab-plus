"use client";

import { heroTitleSmClassName } from "@/components/ui/page-hero-layout";
import { contentBoxClassName } from "@/components/ui/content-box-layout";
import {
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
import { formatAddFeedback } from "@/lib/add-to-cart";
import { goToCart } from "@/lib/checkout-flow";
import { useAddToCart } from "@/lib/use-add-to-cart";
import type { CatalogSummary } from "@/lib/catalog";
import { formatResultTimeValue, parsePackageComposition } from "@/lib/offer-format";
import { getCartCount, getCartTotal } from "@/lib/cart";

export function OfertaClient({ item }: { item: CatalogSummary }) {
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
  const price = item.cena;
  const isPakiet = item.typ === "pakiet";

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
    if (price == null) return;
    requestAdd({
      kind: "catalog",
      slug: item.slug,
      id: item.id,
      nazwa: item.nazwa,
      cena: item.cena,
      typ: item.typ,
    });
  }

  return (
    <MobileShell
      showBack
      backFallback="/"
      stickyFooter={
        <CartActions
          onAdd={handleAdd}
          onOpenCart={() => goToCart(router)}
          addLabel={price != null ? "Dodaj do koszyka" : "Niedostępne online"}
          disabled={price == null}
          cartCount={cartCount}
          cartTotal={cartTotal}
        />
      }
    >
      {addedMsg && <p className={cartToastClassName}>{addedMsg}</p>}
      <div className={ofertaDetailClassName}>
      <span className={productBadgeClassName}>{isPakiet ? "Pakiet" : "Badanie"}</span>
      <h2 className={heroTitleSmClassName}>{item.nazwa}</h2>

      <div className={priceBigClassName}>{price != null ? `${price} zł` : "—"}</div>
      <p className={priceNoteClassName}>Cena z cennika Diagnostyki · wynik: {formatResultTimeValue(item.czas)}</p>

      {item.kategorie && (
        <div className={contentBoxClassName}>
          <h3>Kategoria</h3>
          <CatalogProse text={item.kategorie} />
        </div>
      )}

      {item.opis && (
        <div className={contentBoxClassName}>
          <h3>Opis</h3>
          <CatalogProse text={item.opis} />
        </div>
      )}

      {isPakiet && item.sklad_pakietu && (
        <div className={contentBoxClassName}>
          <h3>Skład pakietu</h3>
          <CatalogProseList items={parsePackageComposition(item.sklad_pakietu)} />
        </div>
      )}

      {item.przygotowanie && (
        <div className={contentBoxClassName}>
          <h3>Przygotowanie</h3>
          <CatalogProse text={item.przygotowanie} />
        </div>
      )}
      </div>
    </MobileShell>
  );
}
