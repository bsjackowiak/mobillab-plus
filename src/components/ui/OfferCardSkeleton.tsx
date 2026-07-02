import {
  cardActionsCartClassName,
  cardActionsClassName,
  cardInfoBtnRemoveClassName,
  offerCardListClassName,
  offerCardListEnterClassName,
} from "@/components/ui/offer-card-layout";
import styles from "./OfferCard.module.css";

export function OfferCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeletonCard}`} aria-hidden="true">
      <div className={styles.body}>
        <div className={styles.skeletonRow}>
          <span className={`skeleton ${styles.skeletonBadge}`} />
          <span className={`skeleton ${styles.skeletonPrice}`} />
        </div>
        <span className={`skeleton ${styles.skeletonTitle}`} />
        <span className={`skeleton ${styles.skeletonMeta}`} />
      </div>
      <div className={`${cardActionsClassName} ${styles.actionsSkeleton}`}>
        <span className={`skeleton ${styles.skeletonAction}`} />
        <span className={`skeleton ${styles.skeletonAction}`} />
      </div>
    </div>
  );
}

export function OfferCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div
      className={`${offerCardListClassName} ${offerCardListEnterClassName}`}
      aria-busy="true"
      aria-label="Ładowanie"
    >
      {Array.from({ length: count }, (_, index) => (
        <OfferCardSkeleton key={index} />
      ))}
    </div>
  );
}
