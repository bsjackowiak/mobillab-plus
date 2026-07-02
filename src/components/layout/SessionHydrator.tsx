"use client";

import { shouldHydrateSession } from "@/lib/session-hydration-routes";
import { hydrateSession } from "@/lib/session-sync";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function SessionHydrator() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldHydrateSession(pathname)) return;
    void hydrateSession();
  }, [pathname]);

  return null;
}
