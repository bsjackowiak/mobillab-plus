import { parseCatalogText, type CatalogProseBlock } from "@/lib/catalog-text";
import styles from "./CatalogProse.module.css";

function ProseBlockView({ block }: { block: CatalogProseBlock }) {
  if (block.type === "h") {
    return <p className={styles.heading}>{block.text}</p>;
  }

  if (block.type === "ul") {
    return (
      <ul className={styles.list}>
        {block.items.map((item, itemIndex) => (
          <li key={`${itemIndex}-${item}`}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <p className={`${styles.p}${block.preLine ? ` ${styles.pPre}` : ""}`}>{block.text}</p>
  );
}

export function CatalogProse({ text }: { text: string }) {
  const blocks = parseCatalogText(text);
  if (blocks.length === 0) return null;

  return (
    <div className={styles.root}>
      {blocks.map((block, index) => (
        <ProseBlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}

export function CatalogProseList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}
