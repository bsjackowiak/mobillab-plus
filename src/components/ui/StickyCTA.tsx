import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  subtitle?: string;
};

export function StickyCTA({ children, subtitle }: Props) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 px-5 pb-[34px] pt-12"
      style={{ background: "linear-gradient(transparent, var(--background) 20%)" }}
    >
      {subtitle && (
        <p className="mb-2 text-center text-[12px] text-muted">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
