"use client";

import type { CheckoutClientConfig } from "@/lib/payment-config";
import styles from "./CheckoutPaymentNotice.module.css";

type Props = {
  config: CheckoutClientConfig;
  demoAcknowledged: boolean;
  onDemoAckChange: (value: boolean) => void;
};

export function CheckoutPaymentNotice({ config, demoAcknowledged, onDemoAckChange }: Props) {
  if (config.mode === "live" && config.liveReady) {
    const providerLabel =
      config.provider === "payu"
        ? "PayU"
        : config.provider === "przelewy24"
          ? "Przelewy24"
          : "bramki płatności";
    return (
      <div className={`${styles.notice} ${styles.noticeLive}`} role="status">
        <strong>Płatność online ({providerLabel})</strong>
        <p>
          Po kliknięciu „Zapłać” przekierujemy Cię do bezpiecznej bramki {providerLabel}. Dostępne
          m.in. BLIK, karta i szybki przelew.
        </p>
      </div>
    );
  }

  if (config.mode === "live" && !config.liveReady) {
    return (
      <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
        <strong>Płatności niedostępne</strong>
        <p>
          Tryb produkcyjny jest włączony, ale brakuje konfiguracji PSP. Skontaktuj się z
          administratorem serwisu.
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.notice} ${styles.noticeDemo}`} role="status">
      <strong>Tryb demonstracyjny</strong>
      <p>
        To zamówienie nie pobierze realnej opłaty. Numer zamówienia i e-mail potwierdzający są
        generowane jak w produkcji — bez integracji z bankiem.
      </p>
      <label className={styles.demoAck}>
        <input
          type="checkbox"
          checked={demoAcknowledged}
          onChange={(e) => onDemoAckChange(e.target.checked)}
        />
        <span>Rozumiem — to zamówienie demonstracyjne bez realnej płatności</span>
      </label>
    </div>
  );
}

export function checkoutPayButtonLabel(
  config: CheckoutClientConfig,
  grandTotal: number | null,
): string {
  if (grandTotal == null) return "Brak ceny";
  if (config.mode === "demo") return `Potwierdź zamówienie (demo) · ${grandTotal} zł`;
  if (!config.liveReady) return "Płatność niedostępna";
  return `Zapłać ${grandTotal} zł`;
}

export function isCheckoutPayDisabled(
  config: CheckoutClientConfig,
  grandTotal: number | null,
  invoiceType: unknown,
  demoAcknowledged: boolean,
  paying: boolean,
): boolean {
  if (paying || grandTotal == null) return true;
  if (invoiceType !== "none" && invoiceType !== "personal" && invoiceType !== "company") {
    return true;
  }
  if (config.mode === "demo") return !demoAcknowledged;
  if (config.mode === "live") return !config.liveReady;
  return false;
}
