import {
  CHECKOUT_PROGRESS_STEPS,
  checkoutProgressIndex,
  type CheckoutProgressStep,
} from "@/lib/checkout-progress";
import styles from "./CheckoutProgress.module.css";

type CheckoutProgressProps = {
  current: CheckoutProgressStep;
};

const STATUS_CLASS = {
  done: styles.itemDone,
  current: styles.itemCurrent,
  upcoming: styles.itemUpcoming,
} as const;

export function CheckoutProgress({ current }: CheckoutProgressProps) {
  const currentIndex = checkoutProgressIndex(current);

  return (
    <nav className={styles.root} aria-label="Postęp zamówienia">
      <ol className={styles.list}>
        {CHECKOUT_PROGRESS_STEPS.map((step, index) => {
          const status =
            index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";

          return (
            <li
              key={step.id}
              className={`${styles.item} ${STATUS_CLASS[status]}`}
              aria-current={status === "current" ? "step" : undefined}
            >
              <span className={styles.dot} aria-hidden="true">
                {status === "done" ? "✓" : index + 1}
              </span>
              <span className={styles.label}>{step.label}</span>
            </li>
          );
        })}
      </ol>
      <p className={styles.caption}>
        Krok {currentIndex + 1} z {CHECKOUT_PROGRESS_STEPS.length} ·{" "}
        {CHECKOUT_PROGRESS_STEPS[currentIndex]?.label}
      </p>
    </nav>
  );
}
