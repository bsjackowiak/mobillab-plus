import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-wrap">
      <div className="phone">{children}</div>
    </div>
  );
}
