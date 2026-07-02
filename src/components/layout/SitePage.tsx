import { heroSubClassName, heroTitleCheckoutClassName } from "@/components/ui/page-hero-layout";
import type { ReactNode } from "react";
import styles from "./SitePage.module.css";
import { MobileShell } from "@/components/layout/MobileShell";

export function SitePage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <MobileShell showBack backFallback="/" noCta>
      <h2 className={heroTitleCheckoutClassName}>{title}</h2>
      {subtitle && <p className={heroSubClassName}>{subtitle}</p>}
      <div className={styles.content}>{children}</div>
    </MobileShell>
  );
}
