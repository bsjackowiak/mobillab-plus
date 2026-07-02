import { headerIconBtnClassName } from "@/components/layout/header-chrome-layout";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/contact";

export function PhoneLink() {
  return (
    <a
      href={`tel:${SUPPORT_PHONE_TEL}`}
      className={headerIconBtnClassName}
      aria-label={`Zadzwoń: ${SUPPORT_PHONE_DISPLAY}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path
          d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
