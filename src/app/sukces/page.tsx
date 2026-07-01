"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { startNewOrderAfterSuccess } from "@/lib/cart";
import { collectionSummary } from "@/lib/collection";
import { getOrder } from "@/lib/order-storage";
import { getPatients, getRequiredPatientCount } from "@/lib/patient-storage";
import type { CartItem, OrderState } from "@/lib/types";

export default function SuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const current = getOrder();
    if (!current?.orderNumber) {
      router.replace("/");
      return;
    }
    setOrderNumber(current.orderNumber);
    setOrder(current);
    setItems(current.items);
  }, [router]);

  if (!orderNumber || !order) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <p className="hero-sub">Ładowanie…</p>
      </MobileShell>
    );
  }

  const visit = collectionSummary(order);
  const isHome = order.collectionType === "home";
  const personCount = isHome ? (order.homeVisitPersonCount ?? 1) : 1;
  const patients = getPatients().slice(0, getRequiredPatientCount(order));

  function handleAddMore() {
    startNewOrderAfterSuccess();
    router.push("/");
  }

  return (
    <MobileShell showBack backFallback="/" noCta>
      <div className="success-icon">✓</div>

      <h2 className="success-title">Gotowe!</h2>
      <p className="success-sub">
        {isHome
          ? personCount > 1
            ? `Zamówienie potwierdzone. Pielęgniarka przyjedzie pod adres — badania dla ${personCount} osób, jedna wizyta.`
            : "Zamówienie potwierdzone. Pielęgniarka przyjedzie pod wskazany adres."
          : "Zamówienie potwierdzone. Pokaż QR w punkcie pobrania."}
      </p>

      <div className="qr-card">
        <div className="qr-placeholder">QR CODE</div>
        <strong>Zamówienie #{orderNumber}</strong>
        {patients.length > 1 && (
          <p className="success-items">
            {patients.map((p) => p.fullName).join(" · ")}
          </p>
        )}
      </div>

      <div className="location-card">
        <div className="location-pin">{isHome ? "🏠" : "📍"}</div>
        <div>
          <strong>{visit.title}</strong>
          <span>{visit.detail}</span>
        </div>
      </div>

      <button
        type="button"
        className="btn-primary btn-primary-mt"
        onClick={() => alert("Dodano do kalendarza (demo)")}
      >
        Dodaj do kalendarza
      </button>

      <button type="button" className="btn-secondary btn-secondary-mt" onClick={handleAddMore}>
        + Zamów kolejne badania
      </button>
    </MobileShell>
  );
}
