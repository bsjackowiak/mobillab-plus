import { NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/server/session-cookie";
import { readSession } from "@/lib/server/session-store";

export async function GET() {
  const { sessionId } = await getOrCreateSessionId();
  const session = await readSession(sessionId);
  return NextResponse.json({
    orders: session.completedOrders,
  });
}
