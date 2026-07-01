"use client";

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
    <div className="cart-actions">
      <button type="button" className="btn-secondary" onClick={onAdd} disabled={disabled}>
        {addLabel}
      </button>
      {cartCount > 0 && onOpenCart && (
        <button type="button" className="btn-primary" onClick={onOpenCart}>
          {cartTotal != null
            ? `Koszyk (${cartCount}) · ${cartTotal} zł`
            : `Koszyk (${cartCount})`}
        </button>
      )}
      {priceLabel && cartCount === 0 && (
        <p className="cart-actions-hint">{priceLabel}</p>
      )}
    </div>
  );
}
