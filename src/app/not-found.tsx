import { btnPrimaryBlockLinkClassName } from "@/components/ui/app-button-layout";
import { heroSubClassName, heroTitleCheckoutClassName, heroTitleClassName, heroTitleSmClassName, heroSubTightClassName } from "@/components/ui/page-hero-layout";
import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";

export default function NotFound() {
  return (
    <MobileShell showBack backFallback="/" noCta>
      <h2 className={heroTitleSmClassName}>Nie znaleziono</h2>
      <p className={heroSubClassName}>Ten pakiet nie istnieje.</p>
      <Link href="/" className={btnPrimaryBlockLinkClassName}>
        Wróć na stronę główną
      </Link>
    </MobileShell>
  );
}
