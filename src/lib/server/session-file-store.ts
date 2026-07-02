import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { SessionData } from "@/lib/session-types";
import { emptySession } from "@/lib/session-types";
import { assertValidSessionId, normalizeSession } from "@/lib/server/session-normalize";

const DATA_DIR = path.join(process.cwd(), "data", "sessions");

function sessionFilePath(sessionId: string): string {
  assertValidSessionId(sessionId);
  return path.join(DATA_DIR, `${sessionId}.json`);
}

export async function readFileSession(sessionId: string): Promise<SessionData> {
  const filePath = sessionFilePath(sessionId);
  try {
    const raw = await readFile(filePath, "utf-8");
    return normalizeSession(JSON.parse(raw) as SessionData);
  } catch {
    return emptySession();
  }
}

export async function writeFileSession(sessionId: string, data: SessionData): Promise<void> {
  const filePath = sessionFilePath(sessionId);
  const tmpPath = `${filePath}.tmp`;
  await mkdir(DATA_DIR, { recursive: true });
  const payload = normalizeSession(data);
  await writeFile(tmpPath, JSON.stringify(payload), "utf-8");
  await rename(tmpPath, filePath);
}
