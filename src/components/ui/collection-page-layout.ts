import styles from "./CollectionPage.module.css";
import { chipsClassName } from "./chip-layout";
import { sectionLabelClassName } from "./section-label-layout";

export const collectionSectionLabelClassName = `${sectionLabelClassName} ${styles.sectionLabelCollection}`;
export const collectionHintClassName = styles.hint;
export const collectionChipsClassName = `${chipsClassName} ${styles.chips}`;
export const collectionModesClassName = styles.modes;
export const collectionModeIconClassName = styles.modeIcon;
export const collectionModeTitleClassName = styles.modeTitle;
export const collectionModeMetaClassName = styles.modeMeta;
export const collectionFacilityListClassName = styles.facilityList;
export const collectionFacilityPickMainClassName = styles.facilityPickMain;
export const collectionFacilityPickRatingClassName = styles.facilityPickRating;

export function collectionModeClassName(selected: boolean): string {
  return `${styles.mode}${selected ? ` ${styles.modeSelected}` : ""}`;
}

export function collectionFacilityPickClassName(selected: boolean): string {
  return `${styles.facilityPick}${selected ? ` ${styles.facilityPickSelected}` : ""}`;
}
