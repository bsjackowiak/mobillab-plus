export type CheckoutProgressStep = "koszyk" | "dane" | "pobranie" | "platnosc";

export const CHECKOUT_PROGRESS_STEPS: { id: CheckoutProgressStep; label: string }[] = [
  { id: "koszyk", label: "Koszyk" },
  { id: "dane", label: "Dane" },
  { id: "pobranie", label: "Pobranie" },
  { id: "platnosc", label: "Płatność" },
];

export function checkoutProgressIndex(step: CheckoutProgressStep): number {
  return CHECKOUT_PROGRESS_STEPS.findIndex((entry) => entry.id === step);
}
