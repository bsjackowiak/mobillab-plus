"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/brand/Logo";
import { headerIconBtnClassName } from "@/components/layout/header-chrome-layout";
import { SCREEN_ROOT_CLASS } from "@/components/layout/shell-integration";
import { useCookieConsent } from "@/lib/cookie-consent-context";
import { SITE_MENU_ITEMS } from "@/lib/site-nav";
import styles from "./NavMenu.module.css";

export function NavMenu() {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const { openPreferences } = useCookieConsent();

  useEffect(() => {
    const host = buttonRef.current?.closest(`.${SCREEN_ROOT_CLASS}`);
    setPortalHost(host instanceof HTMLElement ? host : null);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menuPanel = open ? (
    <div className={styles.root}>
      <nav id={menuId} className={styles.panel} aria-label="Menu główne">
        <div className={styles.head}>
          <Logo href="/" size="sm" />
          <button
            type="button"
            className={headerIconBtnClassName}
            aria-label="Zamknij menu"
            onClick={() => setOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ul className={styles.list}>
          {SITE_MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.link} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={`${styles.link} ${styles.linkBtn}`}
              onClick={() => {
                setOpen(false);
                openPreferences();
              }}
            >
              Ustawienia prywatności
            </button>
          </li>
        </ul>
      </nav>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={headerIconBtnClassName}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {portalHost && menuPanel ? createPortal(menuPanel, portalHost) : null}
    </>
  );
}
