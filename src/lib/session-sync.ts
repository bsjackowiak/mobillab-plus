"use client";

import {
  applySessionData,
  getSessionData,
  isSessionHydratedFromServer,
  markSessionHydratedFromServer,
} from "@/lib/session-cache";
import { emptySession } from "@/lib/session-types";
import { readLegacyBrowserSession } from "@/lib/legacy-browser-session";
import {
  isSessionNewer,
  sessionHasLocalData,
  syncSessionToServer,
} from "@/lib/session-api";
import type { SessionData } from "@/lib/session-types";

let hydratePromise: Promise<void> | null = null;

function dispatchRefreshEvents(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("labflow-cart"));
  window.dispatchEvent(new Event("labflow-patients"));
}

function mergeSessions(local: SessionData, remote: SessionData): SessionData {
  const remoteEmpty = !sessionHasLocalData(remote);
  const localEmpty = !sessionHasLocalData(local);

  if (remoteEmpty && !localEmpty) return local;
  if (!remoteEmpty && localEmpty) return remote;
  if (isSessionNewer(remote, local)) return remote;
  if (isSessionNewer(local, remote)) return local;
  return remote;
}

export async function hydrateSession(): Promise<void> {
  if (typeof window === "undefined") return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    const legacy = readLegacyBrowserSession();
    if (sessionHasLocalData(legacy)) {
      applySessionData(legacy);
    }

    try {
      const res = await fetch("/api/session", { credentials: "same-origin" });
      if (!res.ok) throw new Error("session fetch failed");
      const remote = (await res.json()) as SessionData;
      const local = getSessionData();
      const merged = mergeSessions(local, remote);
      applySessionData(merged);
      markSessionHydratedFromServer();

      const remoteEmpty = !sessionHasLocalData(remote);
      const shouldUpload = remoteEmpty && sessionHasLocalData(merged);
      if (shouldUpload) {
        await syncSessionToServer();
      }
    } catch {
      if (!sessionHasLocalData(getSessionData())) {
        applySessionData(emptySession());
      }
    } finally {
      dispatchRefreshEvents();
    }
  })();

  return hydratePromise;
}

export function ensureSessionHydrated(): Promise<void> {
  if (isSessionHydratedFromServer()) return Promise.resolve();
  return hydrateSession();
}

export { scheduleSessionSync } from "@/lib/session-api";
