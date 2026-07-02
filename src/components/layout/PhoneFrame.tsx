"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { CookieConsentRoot } from "@/components/consent/CookieConsentRoot";
import { SiteTopBar } from "@/components/layout/SiteTopBar";
import { APP_MAIN_CLASS, APP_PHONE_ID } from "@/components/layout/shell-integration";
import { CartOverlayProvider } from "@/lib/cart-overlay-context";
import { CookieConsentProvider } from "@/lib/cookie-consent-context";
import { hydrateSession } from "@/lib/session-sync";
import styles from "./PhoneFrame.module.css";

export function PhoneFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateSession();
  }, []);

  return (
    <CookieConsentProvider>
      <div className={styles.appShell}>
        <SiteTopBar />
        <div className={styles.phoneWrap}>
          <div className={`${styles.phone} ${APP_MAIN_CLASS}`} id={APP_PHONE_ID}>
            <CartOverlayProvider>{children}</CartOverlayProvider>
            <CookieConsentRoot />
          </div>
        </div>
      </div>
    </CookieConsentProvider>
  );
}
