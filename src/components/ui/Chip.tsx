"use client";

import { useRouter } from "next/navigation";

type Props = { label: string; catalogSlug: string };

export function Chip({ label, catalogSlug }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/oferta/${catalogSlug}`)}
      className="rounded-full border border-border bg-surface px-[14px] py-2 text-[13px] text-foreground transition-colors hover:border-accent"
    >
      {label}
    </button>
  );
}
