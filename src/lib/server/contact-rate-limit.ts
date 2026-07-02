export { checkRateLimit, clientKeyFromRequest, RATE_LIMITS } from "@/lib/server/rate-limit";
export type { RateLimitResult, RateLimitScope } from "@/lib/server/rate-limit";

import { checkRateLimit } from "@/lib/server/rate-limit";

/** @deprecated Use checkRateLimit("contact", clientKey) */
export async function checkContactRateLimit(clientKey: string) {
  return checkRateLimit("contact", clientKey);
}
