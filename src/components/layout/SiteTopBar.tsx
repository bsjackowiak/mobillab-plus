"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { SITE_TOPBAR_CLASS } from "@/components/layout/shell-integration";
import { TOP_NAV_ITEMS } from "@/lib/site-nav";
import styles from "./SiteTopBar.module.css";

export function SiteTopBar() {
  const pathname = usePathname();

  return (
    <header className={`${styles.topbar} ${SITE_TOPBAR_CLASS}`} aria-label="Nawigacja główna">
      <div className={styles.inner}>
        <Logo href="/" size="md" className={styles.logo} />

        <nav className={styles.topnav} aria-label="Menu">
          <ul className={styles.topnavList}>
            {TOP_NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.topnavLink}${active ? ` ${styles.topnavLinkActive}` : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <HeaderActions />
      </div>
    </header>
  );
}
