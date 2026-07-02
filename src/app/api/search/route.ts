import { listCatalog } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const { items, total } = listCatalog({ query: q, offset: 0, limit: 10 });
  return NextResponse.json({ results: items, total });
}
