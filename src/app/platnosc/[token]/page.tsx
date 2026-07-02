"use client";

import { heroSubClassName, heroTitleCheckoutClassName, heroTitleClassName, heroTitleSmClassName, heroSubTightClassName } from "@/components/ui/page-hero-layout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { checkoutPayErrorClassName } from "@/components/ui/checkout-layout";
import { paymentWaitingSpinnerClassName } from "@/components/ui/payment-waiting-layout";
import type { PublicOrderView } from "@/lib/order-registry-types";

export default function PaymentWaitingPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [order, setOrder] = useState<PublicOrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/zamowienie/${token}`);
        const data = (await res.json()) as PublicOrderView & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Błąd");

        if (cancelled) return;
        setOrder(data);

        if (data.paymentStatus === "paid" || data.paymentStatus === "demo") {
          router.replace(`/sukces/${token}`);
          return;
        }
        if (data.paymentStatus === "failed") {
          setError("Płatność nie powiodła się. Spróbuj ponownie z koszyka.");
          return;
        }

        if (data.paymentStatus === "pending" && !redirecting) {
          const redirectRes = await fetch(`/api/payment/redirect/${token}`);
          if (redirectRes.ok) {
            const redirectData = (await redirectRes.json()) as { redirectUrl?: string | null };
            if (redirectData.redirectUrl) {
              setRedirecting(true);
              window.location.assign(redirectData.redirectUrl);
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Błąd");
      }
    }

    void poll();
    const interval = window.setInterval(() => void poll(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [token, router, redirecting]);

  return (
    <MobileShell showBack backFallback="/checkout" noCta>
      <h2 className={heroTitleCheckoutClassName}>Oczekiwanie na płatność</h2>
      {error ? (
        <p className={checkoutPayErrorClassName} role="alert">
          {error}
        </p>
      ) : (
        <>
          <p className={heroSubClassName}>
            {order
              ? `Zamówienie #${order.orderNumber} — ${order.grandTotal} zł`
              : redirecting
                ? "Przekierowanie do PayU…"
                : "Łączenie z bramką płatności…"}
          </p>
          <div className={paymentWaitingSpinnerClassName} aria-hidden />
          <p className={heroSubClassName}>
            Po zaksięgowaniu płatności przekierujemy Cię automatycznie. Możesz też zamknąć tę
            stronę — link do zamówienia jest w e-mailu.
          </p>
        </>
      )}
    </MobileShell>
  );
}
