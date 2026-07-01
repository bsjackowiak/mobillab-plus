"use client";

import type { ReactNode } from "react";
import { BackButton } from "@/components/layout/BackButton";
import { CartBadge } from "@/components/layout/CartBadge";
import { HomeHeader } from "@/components/layout/HomeHeader";

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
  const bodyClass = noCta || !stickyFooter ? "screen-body no-cta" : "screen-body";

  return (
    <div className="screen">
      <div className={bodyClass}>
        {home ? <HomeHeader /> : showBack && (
          <div className="screen-top-bar">
            <BackButton fallback={backFallback} />
            <CartBadge />
          </div>
        )}
        {children}
      </div>
      {stickyFooter && <div className="sticky-cta">{stickyFooter}</div>}
    </div>
  );
}
