"use client";

import { type RefObject, useEffect } from "react";

export function useInert(targetRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target || !active) return;

    target.inert = true;
    return () => {
      target.inert = false;
    };
  }, [active, targetRef]);
}

export function useInertHostSiblings(
  host: HTMLElement | null,
  exemptRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active || !host) return;

    const exempt = exemptRef.current;
    if (!exempt) return;

    const inerted: HTMLElement[] = [];
    for (const child of host.children) {
      if (child instanceof HTMLElement && child !== exempt) {
        child.inert = true;
        inerted.push(child);
      }
    }

    return () => {
      for (const element of inerted) {
        element.inert = false;
      }
    };
  }, [active, host, exemptRef]);
}
