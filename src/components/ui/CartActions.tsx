"use client";

import { btnPrimaryClassName, btnSecondaryClassName } from "@/components/ui/app-button-layout";
import styles from "./CartActions.module.css";

type Props = {
  onAdd: () => void;
  onOpenCart?: () => void;
  addLabel?: string;
  priceLabel?: string;
  disabled?: boolean;
  cartCount?: number;
  cartTotal?: number | null;
};

export function CartActions({
  onAdd,
  onOpenCart,
  addLabel = "Dodaj do koszyka",
  priceLabel,
  disabled = false,
  cartCount = 0,
  cartTotal = null,
}: Props) {
  return (
    <div className={styles.actions}>
      <button type="button" className={btnSecondaryClassName} onClick={onAdd} disabled={disabled}>
        {addLabel}
      </button>
      {cartCount > 0 && onOpenCart && (
        <button type="button" className={btnPrimaryClassName} onClick={onOpenCart}>
          {cartTotal != null
            ? `Koszyk (${cartCount}) · ${cartTotal} zł`
            : `Koszyk (${cartCount})`}
        </button>
      )}
      {priceLabel && cartCount === 0 && (
        <p className={styles.hint}>{priceLabel}</p>
      )}
    </div>
  );
}
