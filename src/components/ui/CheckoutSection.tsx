import type { ReactNode } from "react";

type Props = {
  title: string;
  done?: boolean;
  children?: ReactNode;
};

export function CheckoutSection({ title, done, children }: Props) {
  return (
    <div className="mb-3 overflow-hidden rounded-[var(--radius-sm)] bg-surface">
      <div className="flex items-center justify-between px-[18px] py-4 text-[15px] font-semibold">
        <span>{title}</span>
        {done && <span className="text-[18px] text-success">✓</span>}
      </div>
      {children && (
        <div className="border-t border-border px-[18px] pb-4 pt-3.5 text-[14px] text-muted">
          {children}
        </div>
      )}
    </div>
  );
}
