"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { CookiePreferencesPanel } from "@/components/consent/CookiePreferencesPanel";

export function CookieConsentRoot() {
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalHost(document.getElementById("app-phone"));
  }, []);

  if (!portalHost) return <CookiePreferencesPanel />;

  return (
    <>
      {createPortal(<CookieConsentBanner />, portalHost)}
      <CookiePreferencesPanel />
    </>
  );
}
