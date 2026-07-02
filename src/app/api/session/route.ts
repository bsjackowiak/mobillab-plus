import { NextResponse } from "next/server";
import { emptySession } from "@/lib/session-types";
import { enforceRateLimit } from "@/lib/server/enforce-rate-limit";
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
  return withSessionCookie(NextResponse.json(data), sessionId, isNew);
}

export async function PUT(request: Request) {
  const limited = await enforceRateLimit(request, "session-write");
  if (limited) return limited;

  const { sessionId, isNew } = await getOrCreateSessionId();

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > SESSION_PUT_MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (raw.length > SESSION_PUT_MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSessionPutPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await writeSession(sessionId, parsed.data);
  return withSessionCookie(NextResponse.json({ ok: true }), sessionId, isNew);
}

export async function DELETE(request: Request) {
  const limited = await enforceRateLimit(request, "session-write");
  if (limited) return limited;

  const { sessionId, isNew } = await getOrCreateSessionId();
  await writeSession(sessionId, emptySession());
  return withSessionCookie(NextResponse.json({ ok: true }), sessionId, isNew);
}
