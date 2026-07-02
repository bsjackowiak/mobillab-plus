import { sensitiveJson } from "@/lib/server/sensitive-api-response";
import { getOrCreateSessionId } from "@/lib/server/session-cookie";
import { readSession } from "@/lib/server/session-store";

export async function GET() {
  const { sessionId } = await getOrCreateSessionId();
  const session = await readSession(sessionId);
  return sensitiveJson({
    orders: session.completedOrders,
  });
}
