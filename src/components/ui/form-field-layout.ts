import styles from "./FormField.module.css";

export const fieldGroupClassName = styles.group;
export const fieldLabelClassName = styles.label;
export const fieldHintClassName = styles.hint;
export const fieldHintSuccessClassName = styles.hintSuccess;
export const fieldErrorTextClassName = styles.errorText;

export const formErrorAlertProps = {
  role: "alert" as const,
  "aria-live": "assertive" as const,
};

export function fieldInputClassName(hasError = false): string {
  return `${styles.input}${hasError ? ` ${styles.inputError}` : ""}`;
}
