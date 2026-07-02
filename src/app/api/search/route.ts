import { listCatalog } from "@/lib/catalog";
import { enforceRateLimit } from "@/lib/server/enforce-rate-limit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "search");
  if (limited) return limited;

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const { items, total } = listCatalog({ query: q, offset: 0, limit: 10 });
  return NextResponse.json({ results: items, total });
}
