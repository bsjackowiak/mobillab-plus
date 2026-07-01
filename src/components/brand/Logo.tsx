import Link from "next/link";
import { BRAND } from "@/lib/brand";

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
      className={`brand-logo brand-logo-${size} brand-logo-${variant} brand-logo-${theme} ${className}`.trim()}
      aria-label={BRAND.name}
    >
      <span className="brand-logo-word">Mobillab</span>
      <span className="brand-logo-plus">+</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="brand-logo-link">
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
