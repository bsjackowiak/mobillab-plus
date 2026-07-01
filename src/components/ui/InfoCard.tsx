import type { ReactNode } from "react";

export function MetaTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-[var(--radius-sm)] bg-surface p-3.5 text-center">
      <strong className="block text-[15px] font-semibold">{value}</strong>
      <span className="text-[12px] text-muted">{label}</span>
    </div>
  );
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4 rounded-[var(--radius-sm)] bg-surface p-[18px]">
      <h2 className="mb-2 text-[15px] font-semibold">{title}</h2>
      <div className="text-[14px] leading-[1.5] text-muted">{children}</div>
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="mb-3 inline-block rounded-md bg-accent-soft px-2.5 py-1.5 text-[12px] font-semibold text-accent">
      {children}
    </span>
  );
}
