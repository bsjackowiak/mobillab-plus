"use client";

import { useRouter } from "next/navigation";

type Props = { label: string; packageId: string };

export function Chip({ label, packageId }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/produkt/${packageId}`)}
      className="rounded-full border border-border bg-surface px-[14px] py-2 text-[13px] text-foreground transition-colors hover:border-accent"
    >
      {label}
    </button>
  );
}
