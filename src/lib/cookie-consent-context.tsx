"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CONSENT_UPDATED_EVENT,
  DEFAULT_COOKIE_PREFERENCES,
  getActivePreferences,
  getStoredConsent,
  hasValidConsentDecision,
  saveConsent,
  type CookieConsentRecord,
  type CookiePreferences,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  ready: boolean;
  showBanner: boolean;
  showPreferences: boolean;
  consent: CookieConsentRecord | null;
  preferences: CookiePreferences;
  acceptAll: () => void;
  rejectAll: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
  updatePreference: (key: keyof CookiePreferences, value: boolean) => void;
  savePreferences: () => void;
  dismissBannerAsReject: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsentRecord | null>(null);
  const [draft, setDraft] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES);

  const refresh = useCallback(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    setShowBanner(!hasValidConsentDecision());
    setDraft(getActivePreferences());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);

    const onUpdate = () => refresh();
    window.addEventListener(CONSENT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const acceptAll = useCallback(() => {
    const record = saveConsent(
      { functional: true, analytics: true, marketing: true },
      "banner-accept-all",
    );
    setConsent(record);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const rejectAll = useCallback(() => {
    const record = saveConsent({ ...DEFAULT_COOKIE_PREFERENCES }, "banner-reject-all");
    setConsent(record);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const dismissBannerAsReject = useCallback(() => {
    const record = saveConsent({ ...DEFAULT_COOKIE_PREFERENCES }, "banner-close");
    setConsent(record);
    setShowBanner(false);
  }, []);

  const openPreferences = useCallback(() => {
    setDraft(getActivePreferences());
    setShowPreferences(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferences(false);
    if (!hasValidConsentDecision()) {
      setShowBanner(true);
    }
  }, []);

  const updatePreference = useCallback((key: keyof CookiePreferences, value: boolean) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const savePreferences = useCallback(() => {
    const record = saveConsent(draft, "preferences");
    setConsent(record);
    setShowBanner(false);
    setShowPreferences(false);
  }, [draft]);

  const value = useMemo(
    () => ({
      ready,
      showBanner,
      showPreferences,
      consent,
      preferences: draft,
      acceptAll,
      rejectAll,
      openPreferences,
      closePreferences,
      updatePreference,
      savePreferences,
      dismissBannerAsReject,
    }),
    [
      ready,
      showBanner,
      showPreferences,
      consent,
      draft,
      acceptAll,
      rejectAll,
      openPreferences,
      closePreferences,
      updatePreference,
      savePreferences,
      dismissBannerAsReject,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}
