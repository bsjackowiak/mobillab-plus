import styles from "./ApiErrorState.module.css";

type ApiErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function ApiErrorState({
  message = "Nie udało się załadować danych.",
  onRetry,
}: ApiErrorStateProps) {
  return (
    <div className={styles.root} role="alert">
      <p className={styles.message}>{message}</p>
      <button type="button" className={styles.retryBtn} onClick={onRetry}>
        Spróbuj ponownie
      </button>
    </div>
  );
}
