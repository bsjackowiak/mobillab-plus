import styles from "./Chip.module.css";

export const chipsClassName = styles.chips;
export const chipClassName = styles.chip;
export const chipSelectedClassName = styles.chipSelected;
export const chipDisabledClassName = styles.chipDisabled;

export function chipClassNames(selected = false, disabled = false): string {
  let className = styles.chip;
  if (selected) className += ` ${styles.chipSelected}`;
  if (disabled) className += ` ${styles.chipDisabled}`;
  return className;
}
