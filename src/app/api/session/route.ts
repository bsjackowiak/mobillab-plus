import { NextResponse } from "next/server";
import { emptySession, type SessionData } from "@/lib/session-types";
import {
  getOrCreateSessionId,
  sessionCookieOptions,
} from "@/lib/server/session-cookie";
import { readSession, writeSession } from "@/lib/server/session-store";

function normalizePayload(body: unknown): SessionData | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Partial<SessionData>;
  return {
    order: raw.order ?? { items: [] },
    patients: Array.isArray(raw.patients) ? raw.patients : [],
    lastPatientId: raw.lastPatientId ?? null,
    completedOrders: Array.isArray(raw.completedOrders) ? raw.completedOrders : [],
    updatedAt: new Date().toISOString(),
  };
}

function withSessionCookie<T>(response: NextResponse<T>, sessionId: string, isNew: boolean) {
  if (isNew) {
    response.cookies.set(sessionCookieOptions(sessionId));
  }
  return response;
}

export async function GET() {
  const { sessionId, isNew } = await getOrCreateSessionId();
  const data = await readSession(sessionId);
  return withSessionCookie(NextResponse.json(data), sessionId, isNew);
}

export async function PUT(request: Request) {
  const { sessionId, isNew } = await getOrCreateSessionId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = normalizePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid session payload" }, { status: 400 });
  }

  await writeSession(sessionId, payload);
  return withSessionCookie(NextResponse.json({ ok: true }), sessionId, isNew);
}

export async function DELETE() {
  const { sessionId, isNew } = await getOrCreateSessionId();
  await writeSession(sessionId, emptySession());
  return withSessionCookie(NextResponse.json({ ok: true }), sessionId, isNew);
}
