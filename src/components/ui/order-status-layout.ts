import styles from "./OrderStatusBadge.module.css";
import type { PublicOrderView } from "@/lib/order-registry-types";

const STATUS_CLASS: Record<PublicOrderView["paymentStatus"], string> = {
  demo: styles.demo,
  pending: styles.pending,
  paid: styles.paid,
  failed: styles.failed,
};

export function orderStatusBadgeClassName(status: PublicOrderView["paymentStatus"]): string {
  return `${styles.badge} ${STATUS_CLASS[status]}`;
}
