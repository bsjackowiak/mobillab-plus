"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  addCartItem,
  getCartItems,
  getCartTotal,
  notifyCartChange,
  removeCartItem,
} from "@/lib/cart";
import type { CartSuggestion } from "@/lib/cart-suggestion-types";
import { suggestionToCartItem } from "@/lib/cart-suggestion-types";
import { goToCheckout } from "@/lib/checkout-flow";
import type { CartItem } from "@/lib/types";

export default function KoszykPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<CartSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addedKey, setAddedKey] = useState<string | null>(null);

  async function loadSuggestions(cartItems: CartItem[]) {
    if (cartItems.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/cart-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });
      if (!res.ok) throw new Error("suggestions failed");
      const data = (await res.json()) as { suggestions: CartSuggestion[] };
      setSuggestions(data.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  function refresh() {
    const cartItems = getCartItems();
    setItems(cartItems);
    setTotal(getCartTotal());
    notifyCartChange();
    void loadSuggestions(cartItems);
  }

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || items.length > 0) return;
    router.replace("/");
  }, [ready, items.length, router]);

  function handleRemove(key: string) {
    removeCartItem(key);
    refresh();
  }

  function handleAddSuggestion(suggestion: CartSuggestion) {
    const added = addCartItem(suggestionToCartItem(suggestion));
    setAddedKey(suggestion.key);
    refresh();
    if (added) {
      setTimeout(() => setAddedKey(null), 1500);
    }
  }

  if (!ready) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <p className="hero-sub">Ładowanie…</p>
      </MobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <p className="hero-sub">Ładowanie…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      showBack
      backFallback="/"
      stickyFooter={
        <button
          type="button"
          className="btn-primary"
          onClick={() => goToCheckout(router)}
          disabled={total == null}
        >
          {total != null ? `Przejdź do płatności · ${total} zł` : "Uzupełnij ceny w koszyku"}
        </button>
      }
    >
      <h2 className="hero-title-checkout">Koszyk</h2>
      <p className="hero-sub">{items.length} {items.length === 1 ? "pozycja" : "pozycje"}</p>

      {items.map((item) => (
        <div key={item.key} className="cart-line">
          <div className="cart-line-main">
            <span className={`search-result-type search-result-type-${item.typ ?? "pakiet"}`}>
              {item.kind === "package" ? "Pakiet" : item.typ === "pakiet" ? "Pakiet" : "Badanie"}
            </span>
            <strong className="cart-line-name">{item.name}</strong>
          </div>
          <div className="cart-line-side">
            <span className="cart-line-price">{item.price != null ? `${item.price} zł` : "—"}</span>
            <button
              type="button"
              className="cart-line-remove"
              onClick={() => handleRemove(item.key)}
              aria-label={`Usuń ${item.name} z koszyka`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <div className="cart-total-row">
        <span>Razem</span>
        <strong>{total != null ? `${total} zł` : "—"}</strong>
      </div>

      {(loadingSuggestions || suggestions.length > 0) && (
        <div className="cart-suggestions">
          <h3 className="cart-suggestions-title">Polecane razem</h3>
          <p className="hero-sub cart-suggestions-sub">
            Badania często dobierane do tego, co masz w koszyku
          </p>

          {loadingSuggestions && suggestions.length === 0 && (
            <p className="hero-sub">Szukam powiązań…</p>
          )}

          {suggestions.map((suggestion) => (
            <div key={suggestion.key} className="cart-suggestion">
              <div className="cart-suggestion-main">
                <span className={`search-result-type search-result-type-${suggestion.typ ?? "pakiet"}`}>
                  {suggestion.kind === "package" ? "Pakiet" : suggestion.typ === "pakiet" ? "Pakiet" : "Badanie"}
                </span>
                <strong className="cart-suggestion-name">{suggestion.name}</strong>
                <span className="cart-suggestion-reason">{suggestion.reason}</span>
              </div>
              <div className="cart-suggestion-side">
                <strong>{suggestion.price != null ? `${suggestion.price} zł` : "—"}</strong>
                <button
                  type="button"
                  className={`cart-suggestion-add${addedKey === suggestion.key ? " added" : ""}`}
                  onClick={() => handleAddSuggestion(suggestion)}
                  aria-label={`Dodaj ${suggestion.name} do koszyka`}
                >
                  {addedKey === suggestion.key ? "✓" : "+"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="btn-secondary btn-secondary-mt" onClick={() => router.push("/")}>
        + Szukaj innych badań
      </button>
    </MobileShell>
  );
}
