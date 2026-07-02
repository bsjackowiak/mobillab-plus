import type { StoredOrderRecord } from "@/lib/order-registry-types";

const TOKEN_RE = /^[a-f0-9-]{36}$/i;
const ORDER_NUMBER_RE = /^ML\+\d{5}$/;

type UpstashResult = { result?: string | null };

async function upstash(command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis is not configured");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash request failed: ${res.status}`);
  return (await res.json()) as UpstashResult;
}

function orderKey(accessToken: string): string {
  if (!TOKEN_RE.test(accessToken)) throw new Error("Invalid order token");
  return `mobillab:order:${accessToken}`;
}

function orderIndexKey(orderNumber: string): string {
  if (!ORDER_NUMBER_RE.test(orderNumber)) throw new Error("Invalid order number");
  return `mobillab:order-num:${orderNumber}`;
}

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 365;

export function isRedisOrderStoreConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function readRedisOrderByToken(token: string): Promise<StoredOrderRecord | null> {
  const { result } = await upstash(["GET", orderKey(token)]);
  if (!result) return null;
  return JSON.parse(result) as StoredOrderRecord;
}

export async function readRedisOrderByNumber(orderNumber: string): Promise<StoredOrderRecord | null> {
  const { result: token } = await upstash(["GET", orderIndexKey(orderNumber)]);
  if (!token) return null;
  return readRedisOrderByToken(token);
}

export async function writeRedisOrder(record: StoredOrderRecord): Promise<void> {
  const payload = JSON.stringify(record);
  await upstash(["SET", orderKey(record.accessToken), payload, "EX", ORDER_TTL_SECONDS]);
  await upstash([
    "SET",
    orderIndexKey(record.orderNumber),
    record.accessToken,
    "EX",
    ORDER_TTL_SECONDS,
  ]);
}
