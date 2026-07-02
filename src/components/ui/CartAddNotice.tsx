"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./CartAddNotice.module.css";

/** Stable hook for global reduced-motion rules */
export const CART_ADD_NOTICE_CLASS = "lf-cart-add-notice";

export function CartAddNotice() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function onAdded(event: Event) {
      const label = (event as CustomEvent<{ patientLabel: string }>).detail?.patientLabel;
      if (!label) return;

      setMessage(`Dodano dla ${label}`);
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setMessage(null);
        timeoutRef.current = null;
      }, 4000);
    }

    window.addEventListener("labflow-cart-added", onAdded);
    return () => {
      window.removeEventListener("labflow-cart-added", onAdded);
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!message) return null;

  return (
    <p className={`${styles.notice} ${CART_ADD_NOTICE_CLASS}`} role="status" aria-live="polite">
      <span>{message}</span>
      <Link href="/koszyk" className={styles.link}>
        Zobacz koszyk
      </Link>
    </p>
  );
}
