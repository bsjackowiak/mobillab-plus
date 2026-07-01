"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { CartActions } from "@/components/ui/CartActions";
import { getCartCount, getCartTotal } from "@/lib/cart";
import { addCatalogToCart, goToCart } from "@/lib/checkout-flow";
import type { CatalogSummary } from "@/lib/catalog";

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

export function OfertaClient({ item }: { item: CatalogSummary }) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState<number | null>(null);
  const [addedMsg, setAddedMsg] = useState("");
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
    const added = addCatalogToCart(router, {
      slug: item.slug,
      id: item.id,
      nazwa: item.nazwa,
      cena: item.cena,
      typ: item.typ,
    });
    setAddedMsg(added ? "Dodano do koszyka" : "Już jest w koszyku");
    setCartCount(getCartCount());
    setCartTotal(getCartTotal());
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
      {addedMsg && <p className="cart-toast">{addedMsg}</p>}
      <span className="product-badge">{isPakiet ? "Pakiet" : "Badanie"}</span>
      <h2 className="hero-title-sm">{item.nazwa}</h2>

      <div className="price-big">{price != null ? `${price} zł` : "—"}</div>
      <p className="price-note">Cena z cennika Diagnostyki · wynik: {item.czas}</p>

      {item.kategorie && (
        <div className="why-box">
          <h3>Kategoria</h3>
          <p>{item.kategorie}</p>
        </div>
      )}

      {item.opis && (
        <div className="why-box">
          <h3>Opis</h3>
          <p>{stripMarkdown(item.opis)}</p>
        </div>
      )}

      {isPakiet && item.sklad_pakietu && (
        <div className="why-box">
          <h3>Skład pakietu</h3>
          <p>{item.sklad_pakietu}</p>
        </div>
      )}

      {item.przygotowanie && (
        <div className="why-box">
          <h3>Przygotowanie</h3>
          <p>{item.przygotowanie}</p>
        </div>
      )}
    </MobileShell>
  );
}
