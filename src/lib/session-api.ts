import { getSessionData } from "@/lib/session-cache";
import type { SessionData } from "@/lib/session-types";

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight: Promise<void> | null = null;

export async function syncSessionToServer(): Promise<void> {
  if (typeof window === "undefined") return;
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    try {
      const payload = getSessionData();
      await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });
    } catch {
      // Offline or transient error — local cache remains; next write retries.
    } finally {
      syncInFlight = null;
    }
  })();

  return syncInFlight;
}

export function scheduleSessionSync(): void {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void syncSessionToServer();
  }, 350);
}

export function sessionHasLocalData(data: SessionData): boolean {
  return (
    (data.order.items?.length ?? 0) > 0 ||
    data.patients.length > 0 ||
    data.completedOrders.length > 0 ||
    Boolean(data.lastPatientId)
  );
}

export function isSessionNewer(a: SessionData, b: SessionData): boolean {
  return new Date(a.updatedAt).getTime() > new Date(b.updatedAt).getTime();
}
