import { getPackageById } from "./packages";
import type { CartItem } from "./types";

export type CartSuggestion = {
  key: string;
  kind: "package" | "catalog";
  packageId?: string;
  catalogSlug?: string;
  catalogId?: number;
  name: string;
  price: number | null;
  typ?: "badanie" | "pakiet";
  reason: string;
};

export function suggestionToCartItem(suggestion: CartSuggestion): CartItem {
  if (suggestion.kind === "package" && suggestion.packageId) {
    const pkg = getPackageById(suggestion.packageId);
    return {
      key: suggestion.key,
      kind: "package",
      packageId: suggestion.packageId,
      name: suggestion.name,
      price: pkg?.price ?? suggestion.price,
    };
  }

  return {
    key: suggestion.key,
    kind: "catalog",
    catalogSlug: suggestion.catalogSlug,
    catalogId: suggestion.catalogId,
    name: suggestion.name,
    price: suggestion.price,
    typ: suggestion.typ,
  };
}
