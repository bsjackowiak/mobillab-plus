"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./CategoriesBrowser.module.css";
import {
  filterFlatCategories,
  formatCategoryCount,
  groupFlatCategoriesByLetter,
  type FlatCategoryEntry,
} from "@/lib/catalog-categories";

type CategoriesBrowserProps = {
  items: FlatCategoryEntry[];
  cataloguedTests: number;
};

export function CategoriesBrowser({ items, cataloguedTests }: CategoriesBrowserProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterFlatCategories(items, query), [items, query]);
  const letterGroups = useMemo(() => groupFlatCategoriesByLetter(filtered), [filtered]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <label className={styles.search} htmlFor="categories-search-input">
          <span className="sr-only">Szukaj kategorii</span>
          <input
            id="categories-search-input"
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj kategorii, np. tarczyca, alergia…"
            autoComplete="off"
          />
        </label>
        <p className={styles.summary}>
          {items.length} kategorii · {formatCategoryCount(cataloguedTests)} w cenniku · od A do Z
        </p>
      </div>

      {letterGroups.length === 0 ? (
        <p className={styles.empty}>Brak kategorii pasujących do „{query.trim()}”.</p>
      ) : (
        <div className={styles.groups}>
          {letterGroups.map((group) => (
            <section
              key={group.letter}
              className={styles.letterSection}
              aria-labelledby={`cat-letter-${group.letter}`}
            >
              <h3 id={`cat-letter-${group.letter}`} className={styles.groupLetter}>
                {group.letter}
              </h3>

              <ul className={styles.flatList}>
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/badania?q=${encodeURIComponent(item.name)}`}
                      className={styles.subLink}
                    >
                      <span className={styles.subName}>{item.name}</span>
                      <span className={styles.subCount}>{formatCategoryCount(item.count)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
