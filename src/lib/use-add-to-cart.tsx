"use client";

import { useCartOverlay } from "@/lib/cart-overlay-context";
import { useActivePatient } from "@/lib/use-active-patient";
import type { AddProductInput, AddToCartResult } from "@/lib/add-to-cart";

type UseAddToCartOptions = {
  onResult?: (result: AddToCartResult) => void;
};

export function useAddToCart(options?: UseAddToCartOptions) {
  const { requestAdd: requestAddOverlay } = useCartOverlay();
  const { patients, activePatientId, setActivePatientId } = useActivePatient();

  function requestAdd(input: AddProductInput): AddToCartResult {
    return requestAddOverlay(input, { onResult: options?.onResult });
  }

  return {
    patients,
    activePatientId,
    setActivePatientId,
    requestAdd,
  };
}
