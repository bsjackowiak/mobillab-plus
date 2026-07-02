import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { logoClassName, logoLinkClassName, logoPlusClassName, logoWordClassName } from "./logo-layout";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "vertical";
  theme?: "color" | "mono" | "white" | "black";
  href?: string;
  className?: string;
};

export function Logo({
  size = "md",
  variant = "horizontal",
  theme = "color",
  href,
  className = "",
}: LogoProps) {
  const content = (
    <span
      className={logoClassName({ size, variant, theme, className })}
      aria-label={BRAND.name}
    >
      <span className={logoWordClassName}>Mobillab</span>
      <span className={logoPlusClassName}>+</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={logoLinkClassName}>
        {content}
      </Link>
    );
  }

  return content;
}

export function LogoMark({
  size = 32,
  theme = "color",
  className = "",
}: {
  size?: number;
  theme?: "color" | "mono" | "white";
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill={theme === "white" ? "#FFFFFF" : theme === "mono" ? "#1D1D1F" : BRAND.colors.blue}
      />
      <path
        d="M16 9V23M9 16H23"
        stroke={theme === "mono" ? "#FFFFFF" : BRAND.colors.orange}
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
