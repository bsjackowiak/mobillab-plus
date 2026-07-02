import { addProductForPatient } from "./add-to-cart";
import { getCartCount, getCartTotal } from "./cart";
import {
  cartAssignmentsComplete,
  cartNeedsAssignment,
  getCartAssignmentStatus,
  syncHomeVisitPersonCount,
} from "./cart-patients";
import { orderHasCollection } from "./collection";
import { getOrder } from "./order-storage";
import { hasRequiredPatients } from "./patient-storage";

type Router = { push: (href: string) => void };

export type CheckoutNextStep =
  | "assign"
  | "dane"
  | "pobranie"
  | "checkout";

export function getNextCheckoutStep(order = getOrder()): CheckoutNextStep {
  syncHomeVisitPersonCount();
  const assignment = getCartAssignmentStatus(order);

  if (assignment.unassigned.length > 0) {
    return "assign";
  }

  if (!hasRequiredPatients(order)) {
    return "dane";
  }

  if (!orderHasCollection(order)) {
    return "pobranie";
  }

  if (cartNeedsAssignment(order) || !cartAssignmentsComplete(order)) {
    return "assign";
  }

  return "checkout";
}

export function checkoutStepHref(step: CheckoutNextStep): string {
  switch (step) {
    case "assign":
      return "/koszyk?focus=assign";
    case "dane":
      return "/dane";
    case "pobranie":
      return "/pobranie";
    case "checkout":
      return "/checkout";
  }
}

export function checkoutStepLabel(
  step: CheckoutNextStep,
  options?: { total?: number | null; includeTotal?: boolean },
): string {
  const totalSuffix =
    options?.includeTotal && options.total != null ? ` · ${options.total} zł` : "";

  switch (step) {
    case "assign":
      return "Przypisz badania do osób";
    case "dane":
      return "Uzupełnij dane kontaktowe";
    case "pobranie":
      return "Wybierz pobranie";
    case "checkout":
      return `Przejdź do płatności${totalSuffix}`;
  }
}

function goNextStep(router: Router) {
  router.push(checkoutStepHref(getNextCheckoutStep()));
}

export function addPackageToCart(
  router: Router,
  packageId: string,
  mode: "continue" | "checkout" = "continue",
): boolean {
  const result = addProductForPatient({ kind: "package", packageId });

  if (mode === "checkout") goNextStep(router);
  return result.status === "added";
}

export function addCatalogToCart(
  router: Router,
  item: {
    slug: string;
    id: number;
    nazwa: string;
    cena: number | null;
    typ: "badanie" | "pakiet";
  },
  mode: "continue" | "checkout" | "stay" = "continue",
): boolean {
  const result = addProductForPatient({ kind: "catalog", ...item });

  if (mode === "checkout") goNextStep(router);
  return result.status === "added";
}

export function goToCart(router: Router) {
  router.push("/koszyk");
}

export function goToCheckout(router: Router) {
  goNextStep(router);
}

export { getCartCount, getCartTotal };
