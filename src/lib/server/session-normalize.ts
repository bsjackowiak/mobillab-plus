import { emptySession, type SessionData } from "@/lib/session-types";

const SESSION_ID_RE = /^[a-f0-9-]{36}$/i;

export function assertValidSessionId(sessionId: string): void {
  if (!SESSION_ID_RE.test(sessionId)) {
    throw new Error("Invalid session id");
  }
}

export function normalizeSession(raw: SessionData | null): SessionData {
  if (!raw) return emptySession();
  return {
    order: raw.order ?? { items: [] },
    patients: Array.isArray(raw.patients) ? raw.patients : [],
    lastPatientId: raw.lastPatientId ?? null,
    completedOrders: Array.isArray(raw.completedOrders) ? raw.completedOrders : [],
    updatedAt: raw.updatedAt ?? new Date(0).toISOString(),
  };
}

export function sessionRedisKey(sessionId: string): string {
  assertValidSessionId(sessionId);
  return `mobillab:session:${sessionId}`;
}

/** 90 dni — jak cookie sesji */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;
