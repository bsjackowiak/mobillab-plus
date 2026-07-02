"use client";

import { btnSecondaryMtClassName } from "@/components/ui/app-button-layout";
import {
  successDemoNoteClassName,
  successIconClassName,
  successItemsClassName,
  successOrderCardClassName,
  successOrderHintClassName,
  successOrderLabelClassName,
  successOrderNumberClassName,
  successSubClassName,
  successTitleClassName,
} from "@/components/ui/success-page-layout";
import { heroSubClassName, heroTitleCheckoutClassName } from "@/components/ui/page-hero-layout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { checkoutInvoiceSummaryClassName } from "@/components/ui/checkout-layout";
import { locationCardClassName, locationPinClassName } from "@/components/ui/location-card-layout";
import { startNewOrderAfterSuccess } from "@/lib/cart";
import { collectionSummary } from "@/lib/collection";
import { hasBillableInvoice, invoiceSummary } from "@/lib/invoice";
import type { PublicOrderView } from "@/lib/order-registry-types";

export default function SuccessTokenPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [orderView, setOrderView] = useState<PublicOrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setEmailWarning(sessionStorage.getItem("mobillab-email-warning"));
    void fetch(`/api/zamowienie/${token}`)
      .then(async (res) => {
        const data = (await res.json()) as PublicOrderView & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Nie znaleziono zamówienia");
        setOrderView(data);
      })
      .catch((err: Error) => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <h2 className={heroTitleCheckoutClassName}>Potwierdzenie</h2>
        <p className={heroSubClassName}>{error}</p>
      </MobileShell>
    );
  }

  if (!orderView) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <p className={heroSubClassName}>Ładowanie…</p>
      </MobileShell>
    );
  }

  const order = orderView.order;
  const visit = collectionSummary(order);
  const isHome = order.collectionType === "home";
  const personCount = isHome ? (order.homeVisitPersonCount ?? 1) : 1;
  const billableInvoiceType = hasBillableInvoice(order.invoiceType) ? order.invoiceType : null;

  function handleAddMore() {
    startNewOrderAfterSuccess();
    router.push("/");
  }

  return (
    <MobileShell showBack backFallback="/" noCta>
      <div className={successIconClassName}>✓</div>

      <h2 className={successTitleClassName}>Gotowe!</h2>
      <p className={successSubClassName}>
        {isHome
          ? personCount > 1
            ? `Zamówienie potwierdzone. Pielęgniarka przyjedzie pod adres — badania dla ${personCount} osób, jedna wizyta.`
            : "Zamówienie potwierdzone. Pielęgniarka przyjedzie pod wskazany adres."
          : "Zamówienie potwierdzone. W punkcie pobrań podaj numer zamówienia."}
      </p>

      <div className={successOrderCardClassName}>
        <span className={successOrderLabelClassName}>Numer zamówienia</span>
        <strong className={successOrderNumberClassName}>#{orderView.orderNumber}</strong>
        <p className={successOrderHintClassName}>
          {isHome
            ? emailWarning ?? "Potwierdzenie wysłaliśmy też na e-mail."
            : emailWarning ?? "Kod QR otrzymasz w wiadomości e-mail przed wizytą w punkcie."}
        </p>
        {orderView.patients.length > 1 && (
          <p className={successItemsClassName}>
            {orderView.patients.map((p) => p.fullName).join(" · ")}
          </p>
        )}
      </div>

      <div className={locationCardClassName}>
        <div className={locationPinClassName}>{isHome ? "🏠" : "📍"}</div>
        <div>
          <strong>{visit.title}</strong>
          <span>{visit.detail}</span>
        </div>
      </div>

      {billableInvoiceType ? (
        <div className={`${locationCardClassName} ${checkoutInvoiceSummaryClassName}`}>
          <div className={locationPinClassName}>🧾</div>
          <div>
            <strong>
              {billableInvoiceType === "personal" ? "Faktura imienna" : "Faktura na firmę"}
            </strong>
            <span>
              {invoiceSummary(
                billableInvoiceType,
                order.invoicePersonal ?? {
                  fullName: "",
                  address: "",
                  postalCode: "",
                  city: "",
                },
                order.invoiceCompany ?? {
                  companyName: "",
                  nip: "",
                  address: "",
                  postalCode: "",
                  city: "",
                },
              )}
            </span>
          </div>
        </div>
      ) : null}

      <p className={successDemoNoteClassName}>
        {orderView.paymentStatus === "demo"
          ? "Zamówienie demonstracyjne — bez realnej płatności. "
          : null}
        {order.items.length} {order.items.length === 1 ? "badanie" : "badań"} w zamówieniu
      </p>

      <Link href={`/zamowienie/${token}`} className={btnSecondaryMtClassName}>
        Zobacz status zamówienia
      </Link>

      <button type="button" className={btnSecondaryMtClassName} onClick={handleAddMore}>
        + Zamów kolejne badania
      </button>
    </MobileShell>
  );
}
