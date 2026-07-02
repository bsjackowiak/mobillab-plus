"use client";

import { useRouter } from "next/navigation";
import { backBtnClassName, backBtnCompactClassName } from "@/components/layout/header-chrome-layout";

export function BackButton({ fallback = "/", compact = false }: { fallback?: string; compact?: boolean }) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }

  return (
    <button
      type="button"
      className={compact ? backBtnCompactClassName : backBtnClassName}
      onClick={handleBack}
      aria-label="Wróć"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {!compact && <span>Wstecz</span>}
    </button>
  );
}
