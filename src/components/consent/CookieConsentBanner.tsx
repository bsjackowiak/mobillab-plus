"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCookieConsent } from "@/lib/cookie-consent-context";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useInertHostSiblings } from "@/lib/use-inert";
import { APP_PHONE_ID } from "@/components/layout/shell-integration";

export function CookieConsentBanner() {
  const panelRef = useRef<HTMLDivElement>(null);
  const { ready, showBanner, acceptAll, rejectAll, openPreferences, dismissBannerAsReject } =
    useCookieConsent();

  useFocusTrap(panelRef, ready && showBanner);

  useEffect(() => {
    if (!ready || !showBanner) return;
    const host = document.getElementById(APP_PHONE_ID);
    if (!host) return;
    const inerted: HTMLElement[] = [];
    const exempt = panelRef.current;
    for (const child of host.children) {
      if (child instanceof HTMLElement && child !== exempt) {
        child.inert = true;
        inerted.push(child);
      }
    }
    return () => {
      for (const element of inerted) {
        element.inert = false;
      }
    };
  }, [ready, showBanner]);

  if (!ready || !showBanner) return null;

  return (
    <div
      ref={panelRef}
      className="cookie-consent-banner"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <button
        type="button"
        className="cookie-consent-close"
        aria-label="Zamknij — odrzuć opcjonalne cookies"
        onClick={dismissBannerAsReject}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      <p className="cookie-consent-eyebrow">Prywatność i cookies</p>
      <h2 id="cookie-consent-title" className="cookie-consent-title">
        Zarządzaj swoją prywatnością
      </h2>
      <p id="cookie-consent-desc" className="cookie-consent-text">
        Używamy plików cookies niezbędnych do działania koszyka i zamówień. Opcjonalne cookies
        (funkcjonalne, analityczne, marketingowe) włączymy tylko po Twojej zgodzie. Więcej w{" "}
        <Link href="/polityka-prywatnosci">polityce prywatności</Link> i{" "}
        <Link href="/polityka-cookies">polityce cookies</Link>.
      </p>

      <div className="cookie-consent-actions">
        <button type="button" className="cookie-consent-btn" onClick={rejectAll}>
          Odrzuć wszystkie
        </button>
        <button type="button" className="cookie-consent-btn" onClick={openPreferences}>
          Dostosuj
        </button>
        <button type="button" className="cookie-consent-btn cookie-consent-btn--primary" onClick={acceptAll}>
          Akceptuj wszystkie
        </button>
      </div>
    </div>
  );
}
