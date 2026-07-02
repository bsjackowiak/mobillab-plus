import type { SessionData } from "@/lib/session-types";
import {
  normalizeSession,
  sessionRedisKey,
  SESSION_TTL_SECONDS,
} from "@/lib/server/session-normalize";
import { emptySession } from "@/lib/session-types";
import { upstashCommand } from "@/lib/server/upstash-rest";

export { isUpstashConfigured as isRedisSessionStoreConfigured } from "@/lib/server/upstash-rest";

export async function readRedisSession(sessionId: string): Promise<SessionData> {
  const key = sessionRedisKey(sessionId);
  const { result } = await upstashCommand(["GET", key]);
  if (!result) return emptySession();
  try {
    return normalizeSession(JSON.parse(String(result)) as SessionData);
  } catch {
    return emptySession();
  }
}

export async function writeRedisSession(sessionId: string, data: SessionData): Promise<void> {
  const key = sessionRedisKey(sessionId);
  const payload = normalizeSession(data);
  await upstashCommand(["SET", key, JSON.stringify(payload), "EX", SESSION_TTL_SECONDS]);
}
