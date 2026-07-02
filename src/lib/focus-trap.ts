const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hidden && element.getClientRects().length > 0,
  );
}

export function getInitialFocusTarget(container: HTMLElement): HTMLElement | null {
  const focusables = getFocusableElements(container);
  return (
    focusables.find((element) => element.matches("input, select, textarea")) ??
    focusables[0] ??
    null
  );
}
