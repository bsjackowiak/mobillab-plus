import styles from "./ConsentBox.module.css";

export const consentBoxClassName = styles.box;
export const consentBoxErrorClassName = styles.error;

export function consentBoxClassNames(hasError = false): string {
  return `${styles.box}${hasError ? ` ${styles.error}` : ""}`;
}
