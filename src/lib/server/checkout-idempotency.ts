import { isUpstashConfigured, upstashCommand } from "@/lib/server/upstash-rest";

const IDEMPOTENCY_TTL_SEC = 60 * 60;
const MAX_KEY_LENGTH = 64;

type CachedCheckout = {
  body: Record<string, unknown>;
  status: number;
};

const memoryCache = new Map<string, CachedCheckout>();

function storageKey(sessionId: string, idempotencyKey: string): string {
  return `mobillab:checkout:idempotency:${sessionId}:${idempotencyKey}`;
}

function normalizeIdempotencyKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_KEY_LENGTH) return null;
  return trimmed;
}

export function readIdempotencyKey(request: Request, bodyKey?: string): string | null {
  const header = request.headers.get("idempotency-key");
  return normalizeIdempotencyKey(bodyKey) ?? normalizeIdempotencyKey(header);
}

export async function getCachedCheckoutResponse(
  sessionId: string,
  idempotencyKey: string,
): Promise<CachedCheckout | null> {
  const key = storageKey(sessionId, idempotencyKey);

  if (isUpstashConfigured()) {
    try {
      const { result } = await upstashCommand(["GET", key]);
      if (typeof result === "string" && result.length > 0) {
        return JSON.parse(result) as CachedCheckout;
      }
      return null;
    } catch {
      return memoryCache.get(key) ?? null;
    }
  }

  return memoryCache.get(key) ?? null;
}

export async function cacheCheckoutResponse(
  sessionId: string,
  idempotencyKey: string,
  body: Record<string, unknown>,
  status = 200,
): Promise<void> {
  const key = storageKey(sessionId, idempotencyKey);
  const payload: CachedCheckout = { body, status };

  if (isUpstashConfigured()) {
    try {
      await upstashCommand(["SET", key, JSON.stringify(payload), "EX", IDEMPOTENCY_TTL_SEC]);
      return;
    } catch {
      // fall through to memory
    }
  }

  memoryCache.set(key, payload);
}
