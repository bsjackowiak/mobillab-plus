"use client";

import styles from "./CartAddIconButton.module.css";

type CartAddIconButtonProps = {
  inCart: boolean;
  disabled?: boolean;
  name: string;
  canAdd?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
};

export function CartAddIconButton({
  inCart,
  disabled,
  name,
  canAdd = true,
  onClick,
  className = "",
}: CartAddIconButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btn}${inCart ? ` ${styles.btnDone}` : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled || !canAdd}
      aria-label={
        inCart
          ? `Dodaj ${name} dla innej osoby`
          : canAdd
            ? `Dodaj ${name} do koszyka`
            : `${name} — niedostępne online`
      }
    >
      {inCart ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 6h15l-1.5 9H8L6 6z" />
          <path d="M12 11v6M9 14h6" />
        </svg>
      )}
    </button>
  );
}
