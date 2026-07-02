"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./HomeRecommendedSection.module.css";
import { RecommendedBadania } from "@/components/ui/RecommendedBadania";
import { RecommendedTiers } from "@/components/ui/RecommendedTiers";
import type { HomeRecommendedTab } from "@/lib/recommended-home";

export function HomeRecommendedSection() {
  const [tab, setTab] = useState<HomeRecommendedTab>("badanie");

  const listHref = tab === "badanie" ? "/badania" : "/pakiety";
  const listLabel = tab === "badanie" ? "Wszystkie badania" : "Wszystkie pakiety";

  return (
    <section className={styles.recommended} aria-label="Polecane oferty">
      <div className={styles.segmented} role="tablist" aria-label="Typ oferty">
        <div className={styles.segmentedTrack}>
          <button
            type="button"
            role="tab"
            id="home-tab-badanie"
            aria-selected={tab === "badanie"}
            aria-controls="home-recommended-panel"
            className={`${styles.segmentedBtn}${tab === "badanie" ? ` ${styles.segmentedBtnActive}` : ""}`}
            onClick={() => setTab("badanie")}
          >
            Badania
          </button>
          <button
            type="button"
            role="tab"
            id="home-tab-pakiet"
            aria-selected={tab === "pakiet"}
            aria-controls="home-recommended-panel"
            className={`${styles.segmentedBtn}${tab === "pakiet" ? ` ${styles.segmentedBtnActive}` : ""}`}
            onClick={() => setTab("pakiet")}
          >
            Pakiety badań
          </button>
          <span
            className={`${styles.segmentedThumb}${tab === "pakiet" ? ` ${styles.segmentedThumbPakiet}` : ""}`}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className={styles.header}>
        <h3 className={styles.title}>Polecane</h3>
        <Link href={listHref} className={styles.more}>
          {listLabel} →
        </Link>
      </div>

      <div
        id="home-recommended-panel"
        role="tabpanel"
        aria-labelledby={tab === "badanie" ? "home-tab-badanie" : "home-tab-pakiet"}
        key={tab}
      >
        {tab === "badanie" ? <RecommendedBadania hideHeader /> : <RecommendedTiers hideHeader />}
      </div>
    </section>
  );
}
