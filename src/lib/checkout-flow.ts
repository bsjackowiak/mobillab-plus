import { addCartItem, getCartCount, getCartTotal } from "./cart";
import { cartAssignmentsComplete, cartNeedsAssignment } from "./cart-patients";
import { orderHasCollection } from "./collection";
import { getOrder } from "./order-storage";
import { getPackageById } from "./packages";
import { hasRequiredPatients } from "./patient-storage";
import type { CartItem } from "./types";

type Router = { push: (href: string) => void };

function goNextStep(router: Router) {
  const order = getOrder();

  if (!hasRequiredPatients(order)) {
    router.push("/dane");
    return;
  }

  if (!orderHasCollection(order)) {
    router.push("/pobranie");
    return;
  }

  if (cartNeedsAssignment(order) || !cartAssignmentsComplete(order)) {
    router.push("/dane?phase=assign");
    return;
  }

  router.push("/checkout");
}

export function addPackageToCart(
  router: Router,
  packageId: string,
  mode: "continue" | "checkout" = "continue",
): boolean {
  const pkg = getPackageById(packageId);
  if (!pkg) return false;

  const item: CartItem = {
    key: `package:${packageId}`,
    kind: "package",
    packageId,
    name: pkg.name,
    price: pkg.price,
  };

  const added = addCartItem(item);
  if (mode === "checkout") goNextStep(router);
  else router.push("/koszyk");
  return added;
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
  const cartItem: CartItem = {
    key: `catalog:${item.slug}`,
    kind: "catalog",
    catalogSlug: item.slug,
    catalogId: item.id,
    name: item.nazwa,
    price: item.cena,
    typ: item.typ,
  };

  const added = addCartItem(cartItem);
  if (mode === "checkout") goNextStep(router);
  else if (mode === "continue") router.push("/koszyk");
  return added;
}

export function goToCart(router: Router) {
  router.push("/koszyk");
}

export function goToCheckout(router: Router) {
  goNextStep(router);
}

export { getCartCount, getCartTotal };
