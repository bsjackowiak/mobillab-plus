import { searchCatalog } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = searchCatalog(q, 10);
  return NextResponse.json({ results });
}
