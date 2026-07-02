import {
  listRecommendedBadania,
  listRecommendedPakiety,
} from "@/lib/recommended-catalog";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const typ = params.get("typ") === "pakiet" ? "pakiet" : "badanie";
  const offset = Math.max(0, Number(params.get("offset") ?? 0) || 0);
  const limit = Math.min(20, Math.max(1, Number(params.get("limit") ?? 3) || 3));

  const result =
    typ === "pakiet"
      ? listRecommendedPakiety(offset, limit)
      : listRecommendedBadania(offset, limit);

  return NextResponse.json(result);
}
