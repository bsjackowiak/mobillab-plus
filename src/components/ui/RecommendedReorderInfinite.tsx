"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { OfferCard, offerCardListClassName, offerCardListEnterClassName } from "@/components/ui/OfferCard";
import { OfferCardSkeleton, OfferCardSkeletonList } from "@/components/ui/OfferCardSkeleton";
import {
  catalogListEndClassName,
  catalogListSentinelClassName,
} from "@/components/ui/catalog-page-layout";
import { HOME_RECOMMENDED_PAGE_SIZE } from "@/lib/recommended-home";

export type RecommendedListItem = {
  id: number;
  slug: string;
  nazwa: string;
  typ: "badanie" | "pakiet";
  cena: number | null;
  czas: string;
  liczbaBadan: number;
};

type RecommendedReorderInfiniteProps = {
  typ: "badanie" | "pakiet";
  pageSize?: number;
  onToast?: (message: string) => void;
};

export function RecommendedReorderInfinite({
  typ,
  pageSize = HOME_RECOMMENDED_PAGE_SIZE,
  onToast,
}: RecommendedReorderInfiniteProps) {
  const [items, setItems] = useState<RecommendedListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

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
        const res = await fetch(`/api/recommended?${params.toString()}`);
        if (!res.ok) throw new Error("recommended fetch failed");

        const data = (await res.json()) as {
          items: RecommendedListItem[];
          hasMore: boolean;
        };

        setHasMore(data.hasMore);
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        offsetRef.current = offset + data.items.length;
      } catch {
        if (replace) {
          setItems([]);
          setHasMore(false);
          setFetchError(true);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [typ, pageSize],
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
      { rootMargin: "160px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, items.length]);

  if (initialLoading) {
    return <OfferCardSkeletonList count={pageSize} />;
  }

  if (fetchError) {
    return (
      <ApiErrorState
        message="Nie udało się załadować poleceń."
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
      <p className="hero-sub">
        {typ === "badanie"
          ? "Brak poleceń — sprawdź katalog badań."
          : "Brak pakietów w katalogu."}
      </p>
    );
  }

  return (
    <>
      <div className={`${offerCardListClassName} ${offerCardListEnterClassName}`}>
        {items.map((item) => (
          <OfferCard
            key={`${item.typ}-${item.slug}`}
            href={`/oferta/${item.slug}`}
            name={item.nazwa}
            typ={item.typ}
            price={item.cena}
            resultTime={item.czas}
            testCount={item.liczbaBadan}
            catalogSlug={item.slug}
            catalogId={item.id}
            onCartToast={onToast}
          />
        ))}
      </div>
      <div ref={sentinelRef} className={catalogListSentinelClassName} aria-hidden />
      {loading && <OfferCardSkeleton />}
      {!hasMore && items.length > 0 && (
        <p className={catalogListEndClassName}>To wszystko</p>
      )}
    </>
  );
}
