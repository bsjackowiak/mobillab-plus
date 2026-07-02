export const CONSENT_POLICY_VERSION = "2026-07-01";

export type OptionalCookieCategory = "functional" | "analytics" | "marketing";

export type CookieCategory = "necessary" | OptionalCookieCategory;

export type CookiePreferences = Record<OptionalCookieCategory, boolean>;

export type CookieConsentSource =
  | "banner-accept-all"
  | "banner-reject-all"
  | "banner-close"
  | "preferences";

export type CookieConsentRecord = {
  version: string;
  decidedAt: string;
  preferences: CookiePreferences;
  source: CookieConsentSource;
};

const STORAGE_KEY = "mobillab-cookie-consent";

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  functional: false,
  analytics: false,
  marketing: false,
};

export const COOKIE_CATEGORY_LABELS: Record<CookieCategory, string> = {
  necessary: "Niezbędne",
  functional: "Funkcjonalne",
  analytics: "Analityczne",
  marketing: "Marketingowe",
};

export const COOKIE_CATEGORY_DESCRIPTIONS: Record<CookieCategory, string> = {
  necessary:
    "Wymagane do działania serwisu: sesja, koszyk, bezpieczeństwo i zapis Twojej decyzji o cookies. Nie można ich wyłączyć.",
  functional:
    "Zapamiętują preferencje interfejsu i ułatwiają korzystanie z serwisu (np. ostatnio wybrany profil).",
  analytics:
    "Pomagają zrozumieć, jak użytkownicy korzystają z serwisu — w sposób zagregowany, bez profilowania reklamowego.",
  marketing:
    "Służą do personalizacji ofert i pomiaru skuteczności kampanii. Obecnie nie są aktywne w wersji demonstracyjnej.",
};

export type CookieDefinition = {
  name: string;
  category: CookieCategory;
  provider: string;
  purpose: string;
  duration: string;
  type: "http" | "local" | "session";
};

export const COOKIE_REGISTRY: CookieDefinition[] = [
  {
    name: "mobillab_session",
    category: "necessary",
    provider: "Mobillab+",
    purpose: "Identyfikacja sesji użytkownika, koszyk i dane zamówienia po stronie serwera.",
    duration: "90 dni",
    type: "http",
  },
  {
    name: "mobillab-cookie-consent",
    category: "necessary",
    provider: "Mobillab+",
    purpose: "Zapis Twojej decyzji dotyczącej plików cookies i jej wersji.",
    duration: "12 miesięcy",
    type: "local",
  },
];

export function getStoredConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (!parsed.version || !parsed.preferences) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasValidConsentDecision(): boolean {
  const stored = getStoredConsent();
  return Boolean(stored && stored.version === CONSENT_POLICY_VERSION);
}

export function saveConsent(
  preferences: CookiePreferences,
  source: CookieConsentSource,
): CookieConsentRecord {
  const record: CookieConsentRecord = {
    version: CONSENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    preferences: { ...preferences },
    source,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(
      new CustomEvent("mobillab-consent-updated", { detail: record }),
    );
  }
  return record;
}

export function getActivePreferences(): CookiePreferences {
  const stored = getStoredConsent();
  if (!stored || stored.version !== CONSENT_POLICY_VERSION) {
    return { ...DEFAULT_COOKIE_PREFERENCES };
  }
  return { ...stored.preferences };
}

export function isCategoryAllowed(category: OptionalCookieCategory): boolean {
  if (!hasValidConsentDecision()) return false;
  return getActivePreferences()[category];
}

export const CONSENT_UPDATED_EVENT = "mobillab-consent-updated";
