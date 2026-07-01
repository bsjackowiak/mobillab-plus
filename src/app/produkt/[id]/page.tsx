"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { CartActions } from "@/components/ui/CartActions";
import { getCartCount, getCartTotal } from "@/lib/cart";
import { addPackageToCart, goToCart } from "@/lib/checkout-flow";
import { getPackageById } from "@/lib/packages";

type Props = { params: Promise<{ id: string }> };

export default function ProductPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const pkg = getPackageById(id);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState<number | null>(null);
  const [addedMsg, setAddedMsg] = useState("");

  useEffect(() => {
    const refresh = () => {
      setCartCount(getCartCount());
      setCartTotal(getCartTotal());
    };
    refresh();
    window.addEventListener("labflow-cart", refresh);
    return () => window.removeEventListener("labflow-cart", refresh);
  }, []);

  if (!pkg) notFound();

  function handleAdd() {
    const added = addPackageToCart(router, pkg!.id);
    setAddedMsg(added ? "Dodano do koszyka" : "Już jest w koszyku");
    setCartCount(getCartCount());
    setCartTotal(getCartTotal());
  }

  const resultDay = pkg.resultTime.split(" ")[0];
  const resultLabel = pkg.resultTime.includes("do")
    ? `wynik ${pkg.resultTime.split(" ").slice(1).join(" ")}`
    : pkg.resultTime;

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
      {addedMsg && <p className="cart-toast">{addedMsg}</p>}
      {pkg.badge && <span className="product-badge">{pkg.badge}</span>}
      <h2 className="hero-title-sm">{pkg.name}</h2>

      <div className="price-big">{pkg.price} zł</div>
      <p className="price-note">Cena all-in · pobranie + wynik online</p>

      <div className="meta-row">
        <div className="meta-item">
          <strong>{resultDay}</strong>
          <span>{resultLabel}</span>
        </div>
        <div className="meta-item">
          <strong>{pkg.testCount} badań</strong>
          <span>w pakiecie</span>
        </div>
        <div className="meta-item">
          <strong>Bez</strong>
          <span>skierowania</span>
        </div>
      </div>

      <div className="why-box">
        <h3>Dlaczego ten pakiet?</h3>
        <p>{pkg.why}</p>
      </div>

      <div className="why-box">
        <h3>Co zawiera</h3>
        <p>{pkg.tests.join(" · ")}</p>
      </div>
    </MobileShell>
  );
}
