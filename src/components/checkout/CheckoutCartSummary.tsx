import {
  checkoutBodyClassName,
  checkoutHeaderClassName,
  checkoutLinkBlockClassName,
  checkoutPatientGroupClassName,
  checkoutPatientNameClassName,
  checkoutRowClassName,
  checkoutRowNameClassName,
  checkoutSectionClassName,
  checkoutTotalInlineClassName,
} from "@/components/ui/checkout-layout";
import type { CartItem } from "@/lib/types";
import type { groupItemsByPatient } from "@/lib/cart-patients";

type Grouped = ReturnType<typeof groupItemsByPatient>;

type Props = {
  items: CartItem[];
  grouped: Grouped;
  collectionFee: number;
  grandTotal: number | null;
  onAddMore: () => void;
};

export function CheckoutCartSummary({
  items,
  grouped,
  collectionFee,
  grandTotal,
  onAddMore,
}: Props) {
  return (
    <div className={checkoutSectionClassName}>
      <div className={checkoutHeaderClassName}>
        <span>Twoje badania ({items.length})</span>
        <span className="check">✓</span>
      </div>
      <div className={checkoutBodyClassName}>
        {grouped.map((group) => (
          <div key={group.patientId} className={checkoutPatientGroupClassName}>
            <p className={checkoutPatientNameClassName}>
              {group.name}
              {group.subtotal != null ? ` · ${group.subtotal} zł` : ""}
            </p>
            {group.items.map((item) => (
              <div key={item.key} className={checkoutRowClassName}>
                <span className={checkoutRowNameClassName}>{item.name}</span>
                <strong>{item.price != null ? `${item.price} zł` : "—"}</strong>
              </div>
            ))}
          </div>
        ))}
        {collectionFee > 0 && (
          <div className={checkoutRowClassName}>
            <span>Pobranie w domu (jedna wizyta)</span>
            <strong>+{collectionFee} zł</strong>
          </div>
        )}
        <div className={checkoutTotalInlineClassName}>
          <span>Razem</span>
          <strong>{grandTotal != null ? `${grandTotal} zł` : "—"}</strong>
        </div>
        <button type="button" className={checkoutLinkBlockClassName} onClick={onAddMore}>
          + Dodaj kolejne badanie lub pakiet
        </button>
      </div>
    </div>
  );
}
