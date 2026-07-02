import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "mobillab_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 90;

const SESSION_ID_RE = /^[a-f0-9-]{36}$/i;

export function isValidSessionId(value: string): boolean {
  return SESSION_ID_RE.test(value);
}

export async function getOrCreateSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE_NAME)?.value;
  if (existing && isValidSessionId(existing)) {
    return { sessionId: existing, isNew: false };
  }
  return { sessionId: randomUUID(), isNew: true };
}

export function sessionCookieOptions(sessionId: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
