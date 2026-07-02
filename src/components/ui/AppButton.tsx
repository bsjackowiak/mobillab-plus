import type { ButtonHTMLAttributes } from "react";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  btnWarmClassName,
} from "@/components/ui/app-button-layout";

type Variant = "primary" | "secondary" | "warm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const variantClassName: Record<Variant, string> = {
  primary: btnPrimaryClassName,
  secondary: btnSecondaryClassName,
  warm: btnWarmClassName,
};

export function AppButton({
  variant = "primary",
  fullWidth = true,
  className = "",
  type = "button",
  ...props
}: Props) {
  const widthClass = fullWidth ? "" : " w-auto";
  return (
    <button
      type={type}
      className={`${variantClassName[variant]}${widthClass}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
