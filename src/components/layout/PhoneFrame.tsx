"use client";

import type { ReactNode } from "react";
import { CookieConsentRoot } from "@/components/consent/CookieConsentRoot";
import { SessionHydrator } from "@/components/layout/SessionHydrator";
import { SiteTopBar } from "@/components/layout/SiteTopBar";
import { APP_MAIN_CLASS, APP_PHONE_ID } from "@/components/layout/shell-integration";
import { CartOverlayProvider } from "@/lib/cart-overlay-context";
import { CookieConsentProvider } from "@/lib/cookie-consent-context";
import styles from "./PhoneFrame.module.css";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <CookieConsentProvider>
      <SessionHydrator />
      <a href="#main-content" className={`sr-only ${styles.skipLink}`}>
        Przejdź do treści
      </a>
      <div className={styles.appShell}>
        <SiteTopBar />
        <div className={styles.phoneWrap}>
          <div
            className={`${styles.phone} ${APP_MAIN_CLASS}`}
            id={APP_PHONE_ID}
            tabIndex={-1}
          >
            <CartOverlayProvider>{children}</CartOverlayProvider>
            <CookieConsentRoot />
          </div>
        </div>
      </div>
    </CookieConsentProvider>
  );
}
