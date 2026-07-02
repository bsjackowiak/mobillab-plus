import { listCatalog } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q") ?? "";
  const typ = params.get("typ");
  const offset = Math.max(0, Number(params.get("offset") ?? 0) || 0);
  const limit = Math.min(40, Math.max(1, Number(params.get("limit") ?? 20) || 20));

  const result = listCatalog({
    query,
    typ: typ === "badanie" || typ === "pakiet" ? typ : undefined,
    offset,
    limit,
  });

  return NextResponse.json(result);
}
