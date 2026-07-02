import { isUpstashConfigured, upstashCommand } from "@/lib/server/upstash-rest";

export type RateLimitScope = "contact" | "session-read" | "session-write" | "search" | "nip-lookup";

export type RateLimitConfig = {
  max: number;
  windowMs: number;
};

export const RATE_LIMITS: Record<RateLimitScope, RateLimitConfig> = {
  contact: { max: 8, windowMs: 60 * 60 * 1000 },
  "session-read": { max: 180, windowMs: 60 * 1000 },
  "session-write": { max: 60, windowMs: 60 * 1000 },
  search: { max: 120, windowMs: 60 * 1000 },
  "nip-lookup": { max: 30, windowMs: 60 * 60 * 1000 },
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSec?: number;
};

type MemoryBucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, MemoryBucket>();

function memoryKey(scope: RateLimitScope, clientKey: string): string {
  return `${scope}:${clientKey}`;
}

function pruneMemoryBuckets(now: number) {
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) memoryBuckets.delete(key);
  }
}

function checkMemoryRateLimit(
  scope: RateLimitScope,
  clientKey: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  pruneMemoryBuckets(now);

  const key = memoryKey(scope, clientKey);
  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (bucket.count >= config.max) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

async function checkRedisRateLimit(
  scope: RateLimitScope,
  clientKey: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const windowSec = Math.max(1, Math.ceil(config.windowMs / 1000));
  const key = `mobillab:rl:${scope}:${clientKey}`;

  const { result: countRaw } = await upstashCommand(["INCR", key]);
  const count = typeof countRaw === "number" ? countRaw : Number(countRaw ?? 0);

  if (count === 1) {
    await upstashCommand(["EXPIRE", key, windowSec]);
    return { allowed: true };
  }

  if (count > config.max) {
    const { result: ttlRaw } = await upstashCommand(["TTL", key]);
    const ttl = typeof ttlRaw === "number" ? ttlRaw : Number(ttlRaw ?? windowSec);
    return {
      allowed: false,
      retryAfterSec: Math.max(1, ttl > 0 ? ttl : windowSec),
    };
  }

  return { allowed: true };
}

export async function checkRateLimit(
  scope: RateLimitScope,
  clientKey: string,
  config: RateLimitConfig = RATE_LIMITS[scope],
): Promise<RateLimitResult> {
  const safeKey = clientKey.trim().slice(0, 120) || "unknown";

  if (isUpstashConfigured()) {
    try {
      return await checkRedisRateLimit(scope, safeKey, config);
    } catch {
      return checkMemoryRateLimit(scope, safeKey, config);
    }
  }

  return checkMemoryRateLimit(scope, safeKey, config);
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
