import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";

export default function NotFound() {
  return (
    <MobileShell showBack backFallback="/" noCta>
      <h2 className="hero-title-sm">Nie znaleziono</h2>
      <p className="hero-sub">Ten pakiet nie istnieje.</p>
      <Link href="/" className="btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
        Wróć na stronę główną
      </Link>
    </MobileShell>
  );
}
