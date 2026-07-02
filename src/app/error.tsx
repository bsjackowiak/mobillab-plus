"use client";

import Link from "next/link";
import { AppButton } from "@/components/ui/AppButton";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <main
      id="main-content"
      style={{
        maxWidth: "28rem",
        margin: "3rem auto",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Coś poszło nie tak</h1>
      <p style={{ color: "var(--text-muted, #555)", marginBottom: "1.5rem" }}>
        Wystąpił nieoczekiwany błąd. Możesz spróbować ponownie lub wrócić na stronę główną.
      </p>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre
          style={{
            textAlign: "left",
            fontSize: "0.75rem",
            overflow: "auto",
            padding: "0.75rem",
            background: "var(--surface, #fff)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          {error.message}
        </pre>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <AppButton onClick={() => reset()}>Spróbuj ponownie</AppButton>
        <Link href="/" style={{ color: "var(--accent, #2563eb)", fontWeight: 600 }}>
          Strona główna
        </Link>
      </div>
    </main>
  );
}
