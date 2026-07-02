import { headerIconBtnClassName } from "@/components/layout/header-chrome-layout";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/contact";

export function WhatsAppLink() {
  return (
    <a
      href={SUPPORT_WHATSAPP_URL}
      className={headerIconBtnClassName}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Czat WhatsApp: ${SUPPORT_PHONE_DISPLAY}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path
          d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8 8 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8 8 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.1 8.1 0 0 1 8 8v.5z"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
