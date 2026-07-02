import { NextResponse } from "next/server";
import { getCheckoutClientConfig } from "@/lib/payment-config";

export async function GET() {
  return NextResponse.json(getCheckoutClientConfig());
}
