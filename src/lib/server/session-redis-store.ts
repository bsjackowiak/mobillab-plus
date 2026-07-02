import type { SessionData } from "@/lib/session-types";
import {
  normalizeSession,
  sessionRedisKey,
  SESSION_TTL_SECONDS,
} from "@/lib/server/session-normalize";
import { emptySession } from "@/lib/session-types";

type UpstashResult = { result?: string | null };

async function upstashCommand(command: (string | number)[]): Promise<UpstashResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis is not configured");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Upstash request failed: ${res.status}`);
  }

  return (await res.json()) as UpstashResult;
}

export function isRedisSessionStoreConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function readRedisSession(sessionId: string): Promise<SessionData> {
  const key = sessionRedisKey(sessionId);
  const { result } = await upstashCommand(["GET", key]);
  if (!result) return emptySession();
  try {
    return normalizeSession(JSON.parse(result) as SessionData);
  } catch {
    return emptySession();
  }
}

export async function writeRedisSession(sessionId: string, data: SessionData): Promise<void> {
  const key = sessionRedisKey(sessionId);
  const payload = normalizeSession(data);
  await upstashCommand(["SET", key, JSON.stringify(payload), "EX", SESSION_TTL_SECONDS]);
}
