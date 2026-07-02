import { cleanInlineMarkdown, formatPlainCatalogText } from "./catalog-text";

export { cleanInlineMarkdown, formatPlainCatalogText };

export function stripMarkdown(text: string): string {
  return cleanInlineMarkdown(text);
}
