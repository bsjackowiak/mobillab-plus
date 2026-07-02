import { CartBadge } from "@/components/layout/CartBadge";
import { PhoneLink } from "@/components/layout/PhoneLink";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import {
  headerActionsCartClassName,
  headerActionsClassName,
  headerActionsGroupClassName,
} from "@/components/layout/header-chrome-layout";

export function HeaderActions() {
  return (
    <div className={headerActionsClassName}>
      <div className={headerActionsGroupClassName}>
        <WhatsAppLink />
        <PhoneLink />
      </div>
      <div className={`${headerActionsGroupClassName} ${headerActionsCartClassName}`}>
        <CartBadge />
      </div>
    </div>
  );
}
