"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { SearchBox } from "@/components/ui/SearchBox";
import { addPackageToCart } from "@/lib/checkout-flow";

const POPULAR = [
  { label: "Pakiet kontrolny", id: "control" },
  { label: "Tarczyca", id: "thyroid" },
  { label: "Cholesterol", id: "cholesterol" },
  { label: "Wit. D", id: "vitamin-d" },
];

export default function HomePage() {
  const router = useRouter();

  function handleReorder() {
    addPackageToCart(router, "cholesterol", "checkout");
  }

  return (
    <MobileShell home noCta>
      <h2 className="hero-title">
        Co chcesz
        <br />
        sprawdzić?
      </h2>
      <p className="hero-sub">Wyszukaj badanie lub opisz objawy</p>

      <SearchBox />

      <button type="button" className="btn-primary" onClick={() => router.push("/wizard")}>
        Nie wiem — pomóż mi wybrać
      </button>

      <div className="chips">
        {POPULAR.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            onClick={() => router.push(`/produkt/${item.id}`)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button type="button" className="reorder-card" onClick={handleReorder}>
        <div className="reorder-icon">↻</div>
        <div className="reorder-text">
          <strong>Zamów ponownie</strong>
          <span>Cholesterol + LDL · 89 zł · 1 tap</span>
        </div>
      </button>
    </MobileShell>
  );
}
