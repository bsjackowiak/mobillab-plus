import styles from "./Logo.module.css";

export const BRAND_LOGO_LINK_CLASS = "lf-brand-logo-link";

export const logoLinkClassName = `${styles.link} ${BRAND_LOGO_LINK_CLASS}`;

const SIZE_CLASS = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

const VARIANT_CLASS = {
  horizontal: "",
  vertical: styles.vertical,
} as const;

const THEME_CLASS = {
  color: "",
  mono: styles.mono,
  white: styles.white,
  black: styles.black,
} as const;

export function logoClassName({
  size = "md",
  variant = "horizontal",
  theme = "color",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "vertical";
  theme?: "color" | "mono" | "white" | "black";
  className?: string;
}): string {
  return [styles.logo, SIZE_CLASS[size], VARIANT_CLASS[variant], THEME_CLASS[theme], className]
    .filter(Boolean)
    .join(" ");
}

export const logoWordClassName = styles.word;
export const logoPlusClassName = styles.plus;
