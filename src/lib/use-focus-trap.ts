"use client";

import { getFocusableElements, getInitialFocusTarget } from "@/lib/focus-trap";
import { type RefObject, useEffect, useRef } from "react";

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const trapRoot = container;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const initialTarget = getInitialFocusTarget(trapRoot);
    initialTarget?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const focusables = getFocusableElements(trapRoot);
      if (focusables.length === 0) return;

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    trapRoot.addEventListener("keydown", onKeyDown);

    return () => {
      trapRoot.removeEventListener("keydown", onKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [active, containerRef]);
}
