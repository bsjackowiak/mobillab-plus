import { catalogCartKey, lineCartKey, packageCartKey } from "./cart";
import { getPackageById } from "./packages";
import type { CartItem } from "./types";

export type CartSuggestion = {
  key: string;
  productKey: string;
  kind: "package" | "catalog";
  packageId?: string;
  catalogSlug?: string;
  catalogId?: number;
  name: string;
  price: number | null;
  typ?: "badanie" | "pakiet";
  resultTime: string;
  testCount: number;
  reason: string;
};

export function suggestionToCartItem(suggestion: CartSuggestion, patientId?: string): CartItem {
  const productKey = suggestion.productKey;

  if (suggestion.kind === "package" && suggestion.packageId) {
    const pkg = getPackageById(suggestion.packageId);
    return {
      key: lineCartKey(productKey, patientId),
      productKey,
      kind: "package",
      packageId: suggestion.packageId,
      name: suggestion.name,
      price: pkg?.price ?? suggestion.price,
      patientId,
    };
  }

  return {
    key: lineCartKey(productKey, patientId),
    productKey,
    kind: "catalog",
    catalogSlug: suggestion.catalogSlug,
    catalogId: suggestion.catalogId,
    name: suggestion.name,
    price: suggestion.price,
    typ: suggestion.typ,
    patientId,
  };
}

export function legacySuggestionKeyToProductKey(key: string): string {
  if (key.startsWith("catalog:") || key.startsWith("package:")) return key;
  return key;
}
