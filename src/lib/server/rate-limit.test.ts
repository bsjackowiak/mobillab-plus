import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/server/rate-limit";

describe("checkRateLimit (memory fallback)", () => {
  it("allows requests under the limit", async () => {
    const key = `test-${Date.now()}`;
    const first = await checkRateLimit("search", key, { max: 3, windowMs: 60_000 });
    const second = await checkRateLimit("search", key, { max: 3, windowMs: 60_000 });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });

  it("blocks requests above the limit", async () => {
    const key = `block-${Date.now()}`;
    const config = { max: 2, windowMs: 60_000 };

    await checkRateLimit("search", key, config);
    await checkRateLimit("search", key, config);
    const third = await checkRateLimit("search", key, config);

    expect(third.allowed).toBe(false);
    expect(third.retryAfterSec).toBeGreaterThan(0);
  });
});
