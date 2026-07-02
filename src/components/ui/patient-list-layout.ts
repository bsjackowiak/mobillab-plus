import styles from "./PatientList.module.css";

export const patientListClassName = styles.list;
export const patientCardClassName = styles.card;
export const patientCardActiveClassName = styles.cardActive;
export const patientCardMainClassName = styles.cardMain;
export const patientCardNameClassName = styles.cardName;
export const patientCardMetaClassName = styles.cardMeta;
export const patientCardRemoveClassName = styles.cardRemove;
export const patientIdentitySummaryClassName = styles.identitySummary;

export function patientCardClassNames(active: boolean): string {
  return active ? `${styles.card} ${styles.cardActive}` : styles.card;
}
