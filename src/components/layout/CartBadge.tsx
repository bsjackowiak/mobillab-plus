"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";

export function CartBadge() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCartCount());
    const refresh = () => setCount(getCartCount());
    window.addEventListener("storage", refresh);
    window.addEventListener("labflow-cart", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("labflow-cart", refresh);
    };
  }, []);

  if (pathname === "/koszyk" || count === 0) return null;

  return (
    <Link href="/koszyk" className="cart-badge" aria-label={`Koszyk, ${count} pozycji`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 6h15l-1.5 9H8L6 6z" />
        <path d="M6 6L5 3H2" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
      <span>{count}</span>
    </Link>
  );
}
