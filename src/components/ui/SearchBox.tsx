"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addCatalogItem, catalogCartKey, getCartItems, isInCart } from "@/lib/cart";

type SearchResult = {
  id: number;
  slug: string;
  nazwa: string;
  typ: "badanie" | "pakiet";
  cena: number | null;
  czas: string;
  kategorie: string;
};

export function SearchBox({ placeholder = "tarczyca, cholesterol, zmęczenie..." }: { placeholder?: string }) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [cartKeys, setCartKeys] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState("");

  useEffect(() => {
    const refresh = () => setCartKeys(new Set(getCartItems().map((i) => i.key)));
    refresh();
    window.addEventListener("labflow-cart", refresh);
    return () => window.removeEventListener("labflow-cart", refresh);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setOpen(data.results.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 1800);
  }

  function goTo(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/oferta/${slug}`);
  }

  function handleAdd(item: SearchResult, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (item.cena == null) return;

    const key = catalogCartKey(item.slug);
    if (isInCart(key)) {
      showToast("Już jest w koszyku");
      return;
    }

    const added = addCatalogItem({
      slug: item.slug,
      id: item.id,
      nazwa: item.nazwa,
      cena: item.cena,
      typ: item.typ,
    });

    showToast(added ? "Dodano do koszyka" : "Już jest w koszyku");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      goTo(results[activeIndex]!.slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="search-wrap" ref={rootRef}>
      <label className="search-box">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Wyszukaj badanie lub pakiet"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          role="combobox"
        />
      </label>

      {toast && <p className="search-toast">{toast}</p>}

      {(open || loading) && (
        <div className="search-results" id={listId} role="listbox">
          {loading && <p className="search-results-empty">Szukam…</p>}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <p className="search-results-empty">Brak wyników dla „{query.trim()}”</p>
          )}
          {!loading &&
            results.map((item, index) => {
              const inCart = cartKeys.has(catalogCartKey(item.slug));
              const canAdd = item.cena != null;

              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`search-result${index === activeIndex ? " search-result-active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <button type="button" className="search-result-body" onClick={() => goTo(item.slug)}>
                    <div className="search-result-main">
                      <span className={`search-result-type search-result-type-${item.typ}`}>
                        {item.typ === "pakiet" ? "Pakiet" : "Badanie"}
                      </span>
                      <span className="search-result-name">{item.nazwa}</span>
                      {item.kategorie && <span className="search-result-meta">{item.kategorie}</span>}
                    </div>
                    <div className="search-result-side">
                      {item.cena != null ? <strong>{item.cena} zł</strong> : <span>—</span>}
                      <span>{item.czas}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`search-result-add${inCart ? " search-result-add-done" : ""}`}
                    onClick={(e) => handleAdd(item, e)}
                    disabled={!canAdd || inCart}
                    aria-label={
                      inCart
                        ? `${item.nazwa} — już w koszyku`
                        : canAdd
                          ? `Dodaj ${item.nazwa} do koszyka`
                          : `${item.nazwa} — niedostępne online`
                    }
                  >
                    {inCart ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M6 6h15l-1.5 9H8L6 6z" />
                        <path d="M12 11v6M9 14h6" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
