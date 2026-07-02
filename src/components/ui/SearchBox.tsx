"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OfferCard } from "@/components/ui/OfferCard";
import { primaryCategoryLabel } from "@/lib/catalog-categories";
import { SEARCH_RESULTS_ROOT_CLASS } from "./search-integration";
import { searchToastClassName } from "./search-box-layout";
import styles from "./SearchBox.module.css";

export { searchToastClassName } from "./search-box-layout";

type SearchResult = {
  id: number;
  slug: string;
  nazwa: string;
  typ: "badanie" | "pakiet";
  cena: number | null;
  czas: string;
  kategorie: string;
  liczbaBadan: number;
};
function shortCategory(kategorie: string): string {
  const label = primaryCategoryLabel(kategorie);
  if (!label) return "";
  return label.length > 42 ? `${label.slice(0, 39)}…` : label;
}

export function SearchBox({
  placeholder = "tarczyca, cholesterol, zmęczenie...",
  initialQuery = "",
  onQueryChange,
  mode,
}: {
  placeholder?: string;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  mode?: "dropdown" | "filter";
}) {
  const isFilterMode = mode === "filter" || (mode !== "dropdown" && onQueryChange != null);
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isFilterMode) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

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
        const data = (await res.json()) as { results: SearchResult[]; total?: number };
        setResults(data.results);
        setTotalResults(data.total ?? data.results.length);
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
  }, [query, isFilterMode]);

  useEffect(() => {
    if (isFilterMode) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isFilterMode]);

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

  function goToAllResults() {
    const q = query.trim();
    if (q.length < 2) return;
    setOpen(false);
    router.push(`/badania?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (isFilterMode) return;

    if (e.key === "Enter" && query.trim().length >= 2) {
      if (!open || results.length === 0 || activeIndex < 0) {
        e.preventDefault();
        goToAllResults();
        return;
      }
    }

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

  const showDropdown = !isFilterMode && (open || loading);
  const wrapClassName = [styles.wrap, isFilterMode ? styles.filterWrap : ""].filter(Boolean).join(" ");

  return (
    <div className={wrapClassName} ref={rootRef}>
      <label className={styles.field}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => !isFilterMode && results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Wyszukaj badanie lub pakiet"
          aria-expanded={!isFilterMode && open}
          aria-controls={!isFilterMode ? listId : undefined}
          aria-autocomplete={isFilterMode ? "none" : "list"}
          role={isFilterMode ? "searchbox" : "combobox"}
        />
        {isFilterMode && query.trim().length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => setQuery("")}
            aria-label="Wyczyść wyszukiwanie"
          >
            ✕
          </button>
        )}
      </label>

      {toast && <p className={searchToastClassName}>{toast}</p>}

      {showDropdown && (
        <div
          className={`${styles.results} ${SEARCH_RESULTS_ROOT_CLASS}`}
          id={listId}
          role="listbox"
        >
          {!loading && results.length > 0 && (
            <p className={styles.resultsCount}>
              {totalResults > results.length
                ? `${results.length} z ${totalResults} wyników`
                : `${results.length} ${results.length === 1 ? "wynik" : results.length < 5 ? "wyniki" : "wyników"}`}
            </p>
          )}
          {loading && <p className={styles.resultsEmpty}>Szukam…</p>}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <p className={styles.resultsEmpty}>Brak wyników dla „{query.trim()}”</p>
          )}
          {!loading &&
            results.map((item, index) => {
              const category = shortCategory(item.kategorie);

              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={styles.resultOption}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <OfferCard
                    variant="search"
                    highlighted={index === activeIndex}
                    href={`/oferta/${item.slug}`}
                    name={item.nazwa}
                    typ={item.typ}
                    price={item.cena}
                    resultTime={item.czas}
                    testCount={item.liczbaBadan}
                    catalogSlug={item.slug}
                    catalogId={item.id}
                    category={category || undefined}
                    onCartToast={showToast}
                    onNavigate={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                  />
                </div>
              );
            })}
          {!loading && totalResults > results.length && query.trim().length >= 2 && (
            <Link
              href={`/badania?q=${encodeURIComponent(query.trim())}`}
              className={styles.resultsAll}
              onClick={() => setOpen(false)}
            >
              Pokaż wszystkie wyniki ({totalResults})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
