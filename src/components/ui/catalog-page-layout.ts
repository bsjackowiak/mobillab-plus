import styles from "./CatalogPage.module.css";
import { chipClassName, chipSelectedClassName } from "./chip-layout";

export const catalogPageClassName = styles.page;
export const catalogPageTitleClassName = styles.pageTitle;
export const catalogPageSubClassName = styles.pageSub;
export const catalogPageSearchClassName = styles.pageSearch;
export const catalogPageAsideExtraClassName = styles.pageAsideExtra;
export const catalogSectionClassName = styles.section;
export const catalogSectionTitleClassName = styles.sectionTitle;
export const catalogFilterBarClassName = styles.filterBar;
export const catalogFilterLabelClassName = styles.filterLabel;
export const catalogFilterChipClassName = `${chipClassName} ${chipSelectedClassName} ${styles.filterChip}`;
export const catalogListClassName = styles.list;
export const catalogListStatusClassName = styles.listStatus;
export const catalogListCountClassName = styles.listCount;
export const catalogListEndClassName = `${styles.listStatus} ${styles.listEnd}`;
export const catalogListSentinelClassName = styles.sentinel;
export const catalogFeaturedGridClassName = styles.featuredGrid;
