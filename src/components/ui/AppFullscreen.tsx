"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { heroSubClassName, heroTitleCheckoutClassName } from "@/components/ui/page-hero-layout";
import { useFocusTrap } from "@/lib/use-focus-trap";
import styles from "./AppFullscreen.module.css";

type AppFullscreenProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export function AppFullscreen({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: AppFullscreenProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelClassName = [styles.panel, wide ? styles.panelWide : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Zamknij okno"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.titleHeader}>
            {title}
          </h2>
          <button type="button" className={`${styles.close} ${styles.closeText}`} onClick={onClose}>
            Anuluj
          </button>
          <button
            type="button"
            className={`${styles.close} ${styles.closeIcon}`}
            onClick={onClose}
            aria-label="Zamknij"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          <h2 className={`${heroTitleCheckoutClassName} ${styles.titleBody}`}>{title}</h2>
          {subtitle && <p className={`${heroSubClassName} ${styles.sub}`}>{subtitle}</p>}
          {children}
        </div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
}
