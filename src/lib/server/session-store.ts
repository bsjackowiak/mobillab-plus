import type { SessionData } from "@/lib/session-types";
import { readFileSession, writeFileSession } from "@/lib/server/session-file-store";
import {
  isRedisSessionStoreConfigured,
  readRedisSession,
  writeRedisSession,
} from "@/lib/server/session-redis-store";

export type SessionStoreBackend = "redis" | "file";

export function getSessionStoreBackend(): SessionStoreBackend {
  const forced = process.env.SESSION_STORE?.toLowerCase();
  if (forced === "file") return "file";
  if (forced === "redis") return "redis";
  return isRedisSessionStoreConfigured() ? "redis" : "file";
}

export async function readSession(sessionId: string): Promise<SessionData> {
  if (getSessionStoreBackend() === "redis") {
    return readRedisSession(sessionId);
  }
  return readFileSession(sessionId);
}

export async function writeSession(sessionId: string, data: SessionData): Promise<void> {
  if (getSessionStoreBackend() === "redis") {
    await writeRedisSession(sessionId, data);
    return;
  }
  await writeFileSession(sessionId, data);
}
