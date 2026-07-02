import Link from "next/link";
import { cardInfoBtnClassName } from "@/components/ui/offer-card-layout";

type CardInfoIconButtonProps = {
  href: string;
  name: string;
  className?: string;
  onNavigate?: () => void;
};

export function CardInfoIconButton({ href, name, className = "", onNavigate }: CardInfoIconButtonProps) {
  return (
    <Link
      href={href}
      className={`${cardInfoBtnClassName}${className ? ` ${className}` : ""}`}
      aria-label={`Informacje: ${name}`}
      onClick={() => onNavigate?.()}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      </svg>
    </Link>
  );
}
