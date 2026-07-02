"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import {
  COOKIE_CATEGORY_DESCRIPTIONS,
  COOKIE_CATEGORY_LABELS,
  COOKIE_REGISTRY,
  type CookieCategory,
  type OptionalCookieCategory,
} from "@/lib/cookie-consent";
import { useCookieConsent } from "@/lib/cookie-consent-context";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useInertHostSiblings } from "@/lib/use-inert";

const OPTIONAL_CATEGORIES: OptionalCookieCategory[] = [
  "functional",
  "analytics",
  "marketing",
];

function CategoryToggle({
  category,
  checked,
  disabled,
  onChange,
}: {
  category: CookieCategory;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const id = `cookie-pref-${category}`;
  return (
    <div className="cookie-pref-row">
      <div className="cookie-pref-copy">
        <label htmlFor={id} className="cookie-pref-label">
          {COOKIE_CATEGORY_LABELS[category]}
        </label>
        <p className="cookie-pref-desc">{COOKIE_CATEGORY_DESCRIPTIONS[category]}</p>
      </div>
      <label className="cookie-pref-switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="cookie-pref-switch-ui" aria-hidden />
        <span className="sr-only">
          {checked ? "Włączone" : "Wyłączone"} — {COOKIE_CATEGORY_LABELS[category]}
        </span>
      </label>
    </div>
  );
}

export function CookiePreferencesPanel() {
  const {
    showPreferences,
    preferences,
    updatePreference,
    savePreferences,
    closePreferences,
    rejectAll,
    acceptAll,
  } = useCookieConsent();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  useFocusTrap(panelRef, showPreferences);
  useInertHostSiblings(portalHost, overlayRef, showPreferences);

  useEffect(() => {
    setPortalHost(document.getElementById("app-phone"));
  }, []);

  useEffect(() => {
    if (!showPreferences) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreferences();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showPreferences, closePreferences]);

  if (!showPreferences || !portalHost) return null;

  return createPortal(
    <div ref={overlayRef} className="cookie-pref-root" role="presentation">
      <div
        className="cookie-pref-backdrop"
        aria-hidden
        onClick={closePreferences}
      />
      <div
        ref={panelRef}
        className="cookie-pref-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-pref-title"
      >
        <div className="cookie-pref-head">
          <h2 id="cookie-pref-title" className="cookie-pref-title">
            Ustawienia prywatności
          </h2>
          <button
            type="button"
            className="cookie-consent-close"
            aria-label="Zamknij ustawienia"
            onClick={closePreferences}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="cookie-pref-body">
          <p className="cookie-pref-intro">
            Wybierz kategorie cookies, na które wyrażasz zgodę. Zgodę możesz w każdej chwili
            zmienić w menu. Szczegóły w{" "}
            <Link href="/polityka-cookies" onClick={closePreferences}>
              polityce cookies
            </Link>
            .
          </p>

          <CategoryToggle category="necessary" checked disabled />

          {OPTIONAL_CATEGORIES.map((category) => (
            <CategoryToggle
              key={category}
              category={category}
              checked={preferences[category]}
              onChange={(value) => updatePreference(category, value)}
            />
          ))}

          <details className="cookie-pref-details">
            <summary>Lista plików cookies</summary>
            <ul className="cookie-pref-list">
              {COOKIE_REGISTRY.map((cookie) => (
                <li key={cookie.name}>
                  <strong>{cookie.name}</strong>
                  <span>
                    {COOKIE_CATEGORY_LABELS[cookie.category]} · {cookie.duration} ·{" "}
                    {cookie.purpose}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="cookie-pref-footer">
          <button type="button" className="cookie-consent-btn" onClick={rejectAll}>
            Odrzuć wszystkie
          </button>
          <button type="button" className="cookie-consent-btn" onClick={savePreferences}>
            Zapisz wybór
          </button>
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--primary"
            onClick={acceptAll}
          >
            Akceptuj wszystkie
          </button>
        </div>
      </div>
    </div>,
    portalHost,
  );
}
