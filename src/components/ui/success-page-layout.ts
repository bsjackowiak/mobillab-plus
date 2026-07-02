import styles from "./SuccessPage.module.css";

/** Stable hook for global reduced-motion rules */
export const SUCCESS_ICON_CLASS = "lf-success-icon";

export const successIconClassName = `${styles.icon} ${SUCCESS_ICON_CLASS}`;
export const successTitleClassName = styles.title;
export const successSubClassName = styles.sub;
export const successQrCardClassName = styles.qrCard;
export const successOrderCardClassName = `${styles.qrCard} ${styles.orderCard}`;
export const successOrderLabelClassName = styles.orderLabel;
export const successOrderNumberClassName = styles.orderNumber;
export const successOrderHintClassName = styles.orderHint;
export const successItemsClassName = styles.items;
export const successDemoNoteClassName = styles.demoNote;
