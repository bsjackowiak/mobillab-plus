"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export function AppHeader({ showBack = false }: { showBack?: boolean }) {
  const router = useRouter();

  if (showBack) {
    return (
      <header className="mb-5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Wróć"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </header>
    );
  }

  return (
    <header className="mb-7 flex items-center justify-between">
      <Logo />
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-border text-[14px] text-muted">
        A
      </div>
    </header>
  );
}
