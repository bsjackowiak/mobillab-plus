import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "ghost";
  size?: "default" | "lg";
};

export function Button({
  children,
  fullWidth = true,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: Props) {
  const sizeClass = size === "lg" ? "py-[18px] text-[17px]" : "py-[18px] text-[17px]";
  const base = `rounded-[var(--radius)] px-6 font-semibold transition-colors duration-150 active:opacity-90 disabled:opacity-50 ${sizeClass}`;
  const styles =
    variant === "primary"
      ? "btn-gradient text-white"
      : "border border-border bg-surface text-foreground hover:border-accent";

  return (
    <button className={`${base} ${styles} ${fullWidth ? "w-full" : ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
