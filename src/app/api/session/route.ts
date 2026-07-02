import { NextResponse } from "next/server";
import { emptySession } from "@/lib/session-types";
import { enforceRateLimit } from "@/lib/server/enforce-rate-limit";
import { sensitiveJson } from "@/lib/server/sensitive-api-response";
import {
  getOrCreateSessionId,
  sessionCookieOptions,
} from "@/lib/server/session-cookie";
import { parseSessionPutPayload, SESSION_PUT_MAX_BYTES } from "@/lib/server/session-schema";
import { readSession, writeSession } from "@/lib/server/session-store";

function withSessionCookie<T>(response: NextResponse<T>, sessionId: string, isNew: boolean) {
  if (isNew) {
    response.cookies.set(sessionCookieOptions(sessionId));
  }
  return response;
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "session-read");
  if (limited) return limited;

  const { sessionId, isNew } = await getOrCreateSessionId();
  const data = await readSession(sessionId);
  return withSessionCookie(sensitiveJson(data), sessionId, isNew);
}

export async function PUT(request: Request) {
  const limited = await enforceRateLimit(request, "session-write");
  if (limited) return limited;

  const { sessionId, isNew } = await getOrCreateSessionId();
  const existing = await readSession(sessionId);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > SESSION_PUT_MAX_BYTES) {
    return sensitiveJson({ error: "Payload too large" }, { status: 413 });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return sensitiveJson({ error: "Invalid body" }, { status: 400 });
  }

  if (raw.length > SESSION_PUT_MAX_BYTES) {
    return sensitiveJson({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return sensitiveJson({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSessionPutPayload(body);
  if (!parsed.ok) {
    return sensitiveJson({ error: parsed.error }, { status: 400 });
  }

  await writeSession(sessionId, {
    ...parsed.data,
    completedOrders: existing.completedOrders,
  });
  return withSessionCookie(sensitiveJson({ ok: true }), sessionId, isNew);
}

export async function DELETE(request: Request) {
  const limited = await enforceRateLimit(request, "session-write");
  if (limited) return limited;

  const { sessionId, isNew } = await getOrCreateSessionId();
  await writeSession(sessionId, emptySession());
  return withSessionCookie(sensitiveJson({ ok: true }), sessionId, isNew);
}
