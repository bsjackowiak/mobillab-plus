import styles from "./AppButton.module.css";

export const LF_BTN_PRIMARY = "lf-btn-primary";
export const LF_BTN_WARM = "lf-btn-warm";
export const LF_BTN_SECONDARY = "lf-btn-secondary";

export const btnPrimaryClassName = `${styles.primary} ${LF_BTN_PRIMARY}`;
export const btnSecondaryClassName = `${styles.secondary} ${LF_BTN_SECONDARY}`;
export const btnWarmClassName = `${styles.warm} ${LF_BTN_WARM}`;

export const btnPrimaryMtClassName = `${btnPrimaryClassName} ${styles.primaryMt}`;
export const btnSecondaryMtClassName = `${btnSecondaryClassName} ${styles.secondaryMt}`;
export const btnWarmMtClassName = `${btnWarmClassName} ${styles.warmMt}`;
export const btnPrimaryBlockLinkClassName = `${btnPrimaryClassName} ${styles.blockLink}`;
