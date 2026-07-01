"use client";

import { CartBadge } from "@/components/layout/CartBadge";
import { Logo } from "@/components/brand/Logo";

export function HomeHeader() {
  return (
    <div className="logo-row">
      <Logo href="/" size="md" />
      <div className="logo-row-actions">
        <CartBadge />
      </div>
    </div>
  );
}
