import { getFilteredCartSuggestions } from "@/lib/cart-suggestions-server";
import type { CartItem } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: CartItem[] };
    const items = body.items ?? [];
    const suggestions = getFilteredCartSuggestions(items, 4);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
