import {
  checkoutBodyClassName,
  checkoutHeaderClassName,
  checkoutLinkClassName,
  checkoutSectionClassName,
} from "@/components/ui/checkout-layout";

type Props = {
  title: string;
  detail: string;
  onChange: () => void;
};

export function CheckoutCollectionSection({ title, detail, onChange }: Props) {
  return (
    <div className={checkoutSectionClassName}>
      <div className={checkoutHeaderClassName}>
        <span>{title}</span>
        <span className="check">✓</span>
      </div>
      <div className={checkoutBodyClassName}>
        {detail} ·{" "}
        <button type="button" className={checkoutLinkClassName} onClick={onChange}>
          Zmień
        </button>
      </div>
    </div>
  );
}
