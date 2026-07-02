"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SCREEN_ROOT_CLASS } from "@/components/layout/shell-integration";
import { CartAddNotice } from "@/components/ui/CartAddNotice";
import styles from "./MobileShell.module.css";

export function MobileShell({
  children,
  stickyFooter,
  home = false,
  noCta = false,
  showBack = false,
  backFallback = "/",
}: {
  children: ReactNode;
  stickyFooter?: ReactNode;
  home?: boolean;
  noCta?: boolean;
  showBack?: boolean;
  backFallback?: string;
}) {
  const bodyClassName = [styles.body, noCta || !stickyFooter ? styles.bodyNoCta : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${styles.screen} ${SCREEN_ROOT_CLASS}`}>
      <AppHeader
        variant={home ? "home" : "inner"}
        backFallback={backFallback}
        showBack={showBack}
      />
      <CartAddNotice />
      <div className={bodyClassName}>{children}</div>
      {stickyFooter && <div className={styles.stickyCta}>{stickyFooter}</div>}
    </div>
  );
}
