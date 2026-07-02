"use client";

import {
  catalogFilterBarClassName,
  catalogFilterChipClassName,
  catalogFilterLabelClassName,
  catalogSectionClassName,
  catalogSectionTitleClassName,
} from "@/components/ui/catalog-page-layout";
import { heroSubClassName } from "@/components/ui/page-hero-layout";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogPageLayout } from "@/components/layout/CatalogPageLayout";
import { MobileShell } from "@/components/layout/MobileShell";
import { CatalogInfiniteList } from "@/components/ui/CatalogInfiniteList";
import { SearchBox } from "@/components/ui/SearchBox";

function BadaniaContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [listQuery, setListQuery] = useState(urlQuery);

  useEffect(() => {
    setListQuery(urlQuery);
  }, [urlQuery]);

  const hasFilter = listQuery.trim().length >= 2;

  const filterBar = hasFilter ? (
    <div className={catalogFilterBarClassName}>
      <span className={catalogFilterLabelClassName}>Aktywny filtr</span>
      <span className={catalogFilterChipClassName}>{listQuery.trim()}</span>
    </div>
  ) : null;

  return (
    <MobileShell showBack backFallback="/" noCta>
      <CatalogPageLayout
        title="Badania"
        subtitle="Wyszukaj badanie lub pakiet z cennika"
        search={
          <SearchBox
            mode="filter"
            initialQuery={listQuery}
            onQueryChange={setListQuery}
            placeholder="Szukaj po nazwie, kategorii lub objawie…"
          />
        }
        asideExtra={filterBar}
      >
        <section className={catalogSectionClassName}>
          <h3 className={catalogSectionTitleClassName}>
            {hasFilter ? `Wyniki dla „${listQuery.trim()}”` : "Wszystkie badania"}
          </h3>
          <CatalogInfiniteList typ="badanie" query={listQuery} />
        </section>
      </CatalogPageLayout>
    </MobileShell>
  );
}

export default function BadaniaPage() {
  return (
    <Suspense
      fallback={
        <MobileShell showBack backFallback="/" noCta>
          <p className={heroSubClassName}>Ładowanie…</p>
        </MobileShell>
      }
    >
      <BadaniaContent />
    </Suspense>
  );
}
