"use client";

import type { CatalogSearchResult } from "@/lib/catalog";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import {
  catalogListClassName,
  catalogListCountClassName,
  catalogListEndClassName,
  catalogListSentinelClassName,
  catalogListStatusClassName,
} from "@/components/ui/catalog-page-layout";
import { OfferCard, offerCardListEnterClassName } from "@/components/ui/OfferCard";
import { OfferCardSkeleton, OfferCardSkeletonList } from "@/components/ui/OfferCardSkeleton";
import { searchToastClassName } from "@/components/ui/search-box-layout";
import { useCallback, useEffect, useRef, useState } from "react";

type CatalogInfiniteListProps = {
  typ: "badanie" | "pakiet";
  query?: string;
  pageSize?: number;
};

export function CatalogInfiniteList({ typ, query = "", pageSize = 20 }: CatalogInfiniteListProps) {
  const [items, setItems] = useState<CatalogSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 1800);
  }

  const fetchPage = useCallback(
    async (offset: number, replace: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      if (replace) setFetchError(false);

      try {
        const params = new URLSearchParams({
          typ,
          offset: String(offset),
          limit: String(pageSize),
        });
        if (debouncedQuery.trim().length >= 2) {
          params.set("q", debouncedQuery.trim());
        }

        const res = await fetch(`/api/catalog?${params.toString()}`);
        if (!res.ok) throw new Error("catalog fetch failed");

        const data = (await res.json()) as {
          items: CatalogSearchResult[];
          total: number;
          hasMore: boolean;
        };

        setTotal(data.total);
        setHasMore(data.hasMore);
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        offsetRef.current = offset + data.items.length;
      } catch {
        if (replace) {
          setItems([]);
          setTotal(0);
          setHasMore(false);
          setFetchError(true);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [typ, debouncedQuery, pageSize],
  );

  useEffect(() => {
    offsetRef.current = 0;
    setItems([]);
    setHasMore(true);
    setInitialLoading(true);
    void fetchPage(0, true);
  }, [fetchPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          void fetchPage(offsetRef.current, false);
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, items.length]);

  if (initialLoading) {
    return <OfferCardSkeletonList count={3} />;
  }

  if (fetchError) {
    return (
      <ApiErrorState
        message="Nie udało się załadować katalogu."
        onRetry={() => {
          offsetRef.current = 0;
          setItems([]);
          setHasMore(true);
          setInitialLoading(true);
          void fetchPage(0, true);
        }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <p className={catalogListStatusClassName}>
        {debouncedQuery.trim().length >= 2 ? `Brak wyników dla „${debouncedQuery.trim()}”` : "Brak pozycji do wyświetlenia"}
      </p>
    );
  }

  return (
    <div className={`${catalogListClassName} ${offerCardListEnterClassName}`}>
      {toast && <p className={searchToastClassName}>{toast}</p>}
      <p className={catalogListCountClassName}>
        {total} {total === 1 ? "pozycja" : total < 5 ? "pozycje" : "pozycji"}
      </p>
      {items.map((item) => (
        <OfferCard
          key={item.id}
          href={`/oferta/${item.slug}`}
          name={item.nazwa}
          typ={item.typ}
          price={item.cena}
          resultTime={item.czas}
          testCount={item.liczbaBadan}
          catalogSlug={item.slug}
          catalogId={item.id}
          onCartToast={showToast}
        />
      ))}
      <div ref={sentinelRef} className={catalogListSentinelClassName} aria-hidden />
      {loading && <OfferCardSkeleton />}
      {!hasMore && items.length > 0 && (
        <p className={catalogListEndClassName}>To wszystko</p>
      )}
    </div>
  );
}
