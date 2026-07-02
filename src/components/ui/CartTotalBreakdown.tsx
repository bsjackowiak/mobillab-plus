import { getCollectionFee, getHomeVisitFee } from "@/lib/collection";
import type { CollectionType, OrderState } from "@/lib/types";
import styles from "./CartTotalBreakdown.module.css";

type CartTotalBreakdownProps = {
  itemsTotal: number | null;
  order?: OrderState | null;
  collectionType?: CollectionType;
};

export function CartTotalBreakdown({
  itemsTotal,
  order = null,
  collectionType,
}: CartTotalBreakdownProps) {
  const homeFee = getHomeVisitFee();
  const effectiveType = collectionType ?? order?.collectionType;
  const isHome = effectiveType === "home";
  const isFacility = effectiveType === "facility";
  const collectionFee = isHome ? getCollectionFee("home") : 0;
  const grandTotal = itemsTotal != null ? itemsTotal + collectionFee : null;

  return (
    <div className={styles.breakdown}>
      <div className={styles.line}>
        <span>Badania</span>
        <strong>{itemsTotal != null ? `${itemsTotal} zł` : "—"}</strong>
      </div>

      {isHome && (
        <div className={styles.line}>
          <span>Pobranie w domu</span>
          <strong>+{homeFee} zł</strong>
        </div>
      )}

      {isFacility && (
        <p className={styles.hint}>Punkt pobrań — bez dopłaty za dojazd</p>
      )}

      {!isHome && !isFacility && itemsTotal != null && (
        <p className={styles.hint}>
          Wizyta domowa: +{homeFee} zł — wybierzesz w kroku „Pobranie”
        </p>
      )}

      <div className={`${styles.row} ${styles.rowGrand}`}>
        <span>Razem</span>
        <strong>{grandTotal != null ? `${grandTotal} zł` : "—"}</strong>
      </div>

      {!isHome && itemsTotal != null && (
        <p className={styles.estimate}>
          Szacunkowo z wizytą domową: <strong>{itemsTotal + homeFee} zł</strong>
        </p>
      )}
    </div>
  );
}
