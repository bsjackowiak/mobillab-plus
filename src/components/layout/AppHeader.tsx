"use client";

import { BackButton } from "@/components/layout/BackButton";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { NavMenu } from "@/components/layout/NavMenu";
import { Logo } from "@/components/brand/Logo";
import { APP_HEADER_CLASS } from "@/components/layout/shell-integration";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  variant: "home" | "inner";
  backFallback?: string;
  showBack?: boolean;
};

export function AppHeader({ variant, backFallback = "/", showBack = true }: AppHeaderProps) {
  if (variant === "home") {
    return (
      <header className={`${styles.header} ${styles.headerHome} ${APP_HEADER_CLASS}`}>
        <div className={styles.headerLeft}>
          <div className={styles.navMenuMobile}>
            <NavMenu />
          </div>
          <Logo href="/" size="md" />
        </div>
        <HeaderActions />
      </header>
    );
  }

  return (
    <header className={`${styles.header} ${styles.headerInner} ${APP_HEADER_CLASS}`}>
      <div className={styles.headerLeft}>
        {showBack ? <BackButton fallback={backFallback} compact /> : null}
        <div className={styles.navMenuMobile}>
          <NavMenu />
        </div>
      </div>
      <div className={styles.headerLogoWrap}>
        <Logo href="/" size="sm" />
      </div>
      <HeaderActions />
    </header>
  );
}
