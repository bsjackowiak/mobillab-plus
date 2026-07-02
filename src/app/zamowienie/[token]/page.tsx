"use client";

import { btnSecondaryMtClassName } from "@/components/ui/app-button-layout";
import {
  successOrderCardClassName,
  successOrderHintClassName,
  successOrderLabelClassName,
  successOrderNumberClassName,
} from "@/components/ui/success-page-layout";
import { heroSubClassName, heroTitleCheckoutClassName } from "@/components/ui/page-hero-layout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  checkoutBodyClassName,
  checkoutHeaderClassName,
  checkoutRowClassName,
  checkoutRowNameClassName,
  checkoutSectionClassName,
} from "@/components/ui/checkout-layout";
import { locationCardClassName, locationPinClassName } from "@/components/ui/location-card-layout";
import { orderStatusBadgeClassName } from "@/components/ui/order-status-layout";
import { collectionSummary } from "@/lib/collection";
import type { PublicOrderView } from "@/lib/order-registry-types";

const PAYMENT_LABELS: Record<PublicOrderView["paymentStatus"], string> = {
  demo: "Demonstracyjne",
  pending: "Oczekuje na płatność",
  paid: "Opłacone",
  failed: "Płatność nieudana",
};

export default function OrderStatusPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [order, setOrder] = useState<PublicOrderView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void fetch(`/api/zamowienie/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Błąd");
        setOrder(data as PublicOrderView);
      })
      .catch((err: Error) => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <h2 className={heroTitleCheckoutClassName}>Zamówienie</h2>
        <p className={heroSubClassName}>{error}</p>
      </MobileShell>
    );
  }

  if (!order) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <p className={heroSubClassName}>Ładowanie zamówienia…</p>
      </MobileShell>
    );
  }

  const visit = collectionSummary(order.order);
  const statusClass = orderStatusBadgeClassName(order.paymentStatus);

  return (
    <MobileShell showBack backFallback="/" noCta>
      <h2 className={heroTitleCheckoutClassName}>Twoje zamówienie</h2>
      <p className={heroSubClassName}>Link z wiadomości e-mail — bez logowania.</p>

      <div className={successOrderCardClassName}>
        <span className={successOrderLabelClassName}>Numer zamówienia</span>
        <strong className={successOrderNumberClassName}>#{order.orderNumber}</strong>
        <span className={statusClass}>{PAYMENT_LABELS[order.paymentStatus]}</span>
        <p className={successOrderHintClassName}>Kwota: {order.grandTotal} zł</p>
      </div>

      <div className={locationCardClassName}>
        <div className={locationPinClassName}>{order.order.collectionType === "home" ? "🏠" : "📍"}</div>
        <div>
          <strong>{visit.title}</strong>
          <span>{visit.detail}</span>
        </div>
      </div>

      <div className={checkoutSectionClassName}>
        <div className={checkoutHeaderClassName}>
          <span>Badania ({order.order.items.length})</span>
        </div>
        <div className={checkoutBodyClassName}>
          {order.order.items.map((item) => (
            <div key={item.key} className={checkoutRowClassName}>
              <span className={checkoutRowNameClassName}>{item.name}</span>
              <strong>{item.price != null ? `${item.price} zł` : "—"}</strong>
            </div>
          ))}
        </div>
      </div>

      {order.patients.length > 0 && (
        <p className={heroSubClassName}>
          Pacjenci: {order.patients.map((p) => p.fullName).join(" · ")}
        </p>
      )}

      {order.paymentStatus === "pending" && (
        <p className={heroSubClassName}>
          Po opłaceniu status zaktualizuje się automatycznie.{" "}
          <Link href={`/platnosc/${token}`}>Wróć do ekranu płatności</Link>
        </p>
      )}

      <Link href="/" className={btnSecondaryMtClassName}>
        Zamów kolejne badania
      </Link>
    </MobileShell>
  );
}
