export type CatalogProseBlock =
  | { type: "p"; text: string; preLine?: boolean }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] };

export function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function isBulletLine(line: string): boolean {
  return /^[·•\-–]\s*/.test(line.trim());
}

function bulletText(line: string): string {
  return cleanInlineMarkdown(line.trim().replace(/^[·•\-–]\s*/, ""));
}

function isHeadingSection(section: string): boolean {
  const trimmed = section.trim();
  return /^\*\*[^*]+\*\*:?$/.test(trimmed);
}

export function parseCatalogText(raw: string): CatalogProseBlock[] {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const sections = normalized.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  const blocks: CatalogProseBlock[] = [];
  let pendingBullets: string[] = [];

  function flushBullets() {
    if (pendingBullets.length === 0) return;
    blocks.push({ type: "ul", items: [...pendingBullets] });
    pendingBullets = [];
  }

  for (const section of sections) {
    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 0 && lines.every(isBulletLine)) {
      for (const line of lines) {
        pendingBullets.push(bulletText(line));
      }
      continue;
    }

    if (lines.length === 1 && isBulletLine(lines[0]!)) {
      pendingBullets.push(bulletText(lines[0]!));
      continue;
    }

    flushBullets();

    if (isHeadingSection(section)) {
      blocks.push({ type: "h", text: cleanInlineMarkdown(section) });
      continue;
    }

    if (lines.length > 1) {
      blocks.push({
        type: "p",
        text: lines.map((line) => cleanInlineMarkdown(line)).join("\n"),
        preLine: true,
      });
      continue;
    }

    blocks.push({ type: "p", text: cleanInlineMarkdown(section) });
  }

  flushBullets();
  return blocks;
}

export function formatPlainCatalogText(raw: string): string {
  return parseCatalogText(raw)
    .map((block) => {
      if (block.type === "ul") return block.items.join(" · ");
      if (block.type === "h") return block.text;
      return block.text.replace(/\n/g, " ");
    })
    .join("\n\n")
    .trim();
}
