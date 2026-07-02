import { Suspense } from "react";
import { heroSubClassName } from "@/components/ui/page-hero-layout";
import { MobileShell } from "@/components/layout/MobileShell";
import { BadaniaPageClient } from "./BadaniaPageClient";

export default function BadaniaPage() {
  return (
    <Suspense
      fallback={
        <MobileShell showBack backFallback="/" noCta>
          <p className={heroSubClassName}>Ładowanie…</p>
        </MobileShell>
      }
    >
      <BadaniaPageClient />
    </Suspense>
  );
}
