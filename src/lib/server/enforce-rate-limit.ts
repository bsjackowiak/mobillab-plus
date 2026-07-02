import { NextResponse } from "next/server";
import {
  checkRateLimit,
  clientKeyFromRequest,
  type RateLimitScope,
} from "@/lib/server/rate-limit";

export async function enforceRateLimit(
  request: Request,
  scope: RateLimitScope,
  message = "Zbyt wiele żądań. Spróbuj ponownie za chwilę.",
): Promise<NextResponse | null> {
  const rate = await checkRateLimit(scope, clientKeyFromRequest(request));
  if (rate.allowed) return null;

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: rate.retryAfterSec ? { "Retry-After": String(rate.retryAfterSec) } : undefined,
    },
  );
}
