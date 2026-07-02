import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { StoredOrderRecord } from "@/lib/order-registry-types";

const DATA_DIR = path.join(process.cwd(), "data", "orders");
const TOKEN_RE = /^[a-f0-9-]{36}$/i;
const ORDER_NUMBER_RE = /^ML\+\d{5}$/;

function tokenPath(token: string): string {
  if (!TOKEN_RE.test(token)) throw new Error("Invalid order token");
  return path.join(DATA_DIR, `${token}.json`);
}

function orderNumberIndexPath(orderNumber: string): string {
  if (!ORDER_NUMBER_RE.test(orderNumber)) throw new Error("Invalid order number");
  return path.join(DATA_DIR, "_index", `${orderNumber}.txt`);
}

export async function readFileOrderByToken(token: string): Promise<StoredOrderRecord | null> {
  try {
    const raw = await readFile(tokenPath(token), "utf-8");
    return JSON.parse(raw) as StoredOrderRecord;
  } catch {
    return null;
  }
}

export async function readFileOrderByNumber(orderNumber: string): Promise<StoredOrderRecord | null> {
  try {
    const token = (await readFile(orderNumberIndexPath(orderNumber), "utf-8")).trim();
    if (!token) return null;
    return readFileOrderByToken(token);
  } catch {
    return null;
  }
}

export async function writeFileOrder(record: StoredOrderRecord): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(path.join(DATA_DIR, "_index"), { recursive: true });

  const file = tokenPath(record.accessToken);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(record), "utf-8");
  await rename(tmp, file);

  const indexTmp = `${orderNumberIndexPath(record.orderNumber)}.tmp`;
  await writeFile(indexTmp, record.accessToken, "utf-8");
  await rename(indexTmp, orderNumberIndexPath(record.orderNumber));
}
