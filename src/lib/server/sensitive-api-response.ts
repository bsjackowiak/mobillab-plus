import { NextResponse } from "next/server";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export function sensitiveJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", NO_STORE_HEADERS["Cache-Control"]);
  return NextResponse.json(body, { ...init, headers });
}
