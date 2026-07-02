"use client";

import {
  btnPrimaryClassName,
  btnSecondaryMtClassName,
  btnWarmMtClassName,
} from "@/components/ui/app-button-layout";
import { heroSubClassName, heroTitleCheckoutClassName } from "@/components/ui/page-hero-layout";
import {
  emptyStateClassName,
  emptyStateIconClassName,
  emptyStateSubClassName,
  emptyStateTitleClassName,
} from "@/components/ui/empty-state-layout";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { CartLineItem } from "@/components/ui/CartLineItem";
import { CartTotalBreakdown } from "@/components/ui/CartTotalBreakdown";
import { CheckoutProgress } from "@/components/ui/CheckoutProgress";
import { OfferCard, offerCardListClassName } from "@/components/ui/OfferCard";
import { OfferCardSkeletonList } from "@/components/ui/OfferCardSkeleton";
import {
  cartAssignBannerClassName,
  cartAssignBannerWarnClassName,
  cartGroupsClassName,
  cartPatientGroupClassName,
  cartPatientGroupHeadClassName,
  cartPatientGroupItemsClassName,
  cartPatientGroupMetaClassName,
  cartPatientGroupTitleClassName,
  cartSuggestionsClassName,
  cartSuggestionsSubClassName,
  cartSuggestionsTitleClassName,
} from "@/components/ui/cart-page-layout";
import { checkoutLinkClassName } from "@/components/ui/checkout-layout";
import { heroSubAfterProgressClassName } from "@/components/ui/checkout-progress-layout";
import { searchToastClassName } from "@/components/ui/search-box-layout";
import {
  getCartItems,
  getCartTotal,
  notifyCartChange,
  removeCartItem,
  UNASSIGNED_PATIENT,
} from "@/lib/cart";
import { getCartAssignmentStatus, groupItemsByPatient, syncHomeVisitPersonCount } from "@/lib/cart-patients";
import {
  fetchCatalogItemDetails,
  getCartItemDetails,
  getCatalogPackageSlugs,
} from "@/lib/cart-item-details";
import type { CartItemDetails } from "@/lib/cart-item-details";
import type { CartSuggestion } from "@/lib/cart-suggestion-types";
import { catalogOfferHref, packageOfferHref } from "@/lib/product-href";
import { getOrderGrandTotal } from "@/lib/collection";
import { goToCheckout, checkoutStepLabel, getNextCheckoutStep } from "@/lib/checkout-flow";
import { getOrder } from "@/lib/order-storage";
import {
  patientNeedsCheckoutStep,
} from "@/lib/patient-storage";
import { usePatients } from "@/lib/use-patients";
import type { CartItem } from "@/lib/types";

function KoszykPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusAssign = searchParams.get("focus") === "assign";
  const patients = usePatients();

  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<CartSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [catalogDetailsBySlug, setCatalogDetailsBySlug] = useState<Record<string, CartItemDetails>>({});
  const [suggestionsError, setSuggestionsError] = useState(false);
  const [catalogDetailsError, setCatalogDetailsError] = useState(false);
  const [toast, setToast] = useState("");
  const assignSelectRef = useRef<HTMLSelectElement>(null);

  const assignment = getCartAssignmentStatus(getOrder());
  const firstUnassignedKey = assignment.unassigned[0]?.key ?? null;

  async function loadSuggestions(cartItems: CartItem[]) {
    if (cartItems.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    setSuggestionsError(false);
    try {
      const res = await fetch("/api/cart-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });
      if (!res.ok) throw new Error("suggestions failed");
      const data = (await res.json()) as { suggestions: CartSuggestion[] };
      setSuggestions(data.suggestions);
    } catch {
      setSuggestions([]);
      setSuggestionsError(true);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function loadCatalogDetails(cartItems: CartItem[]) {
    const slugs = getCatalogPackageSlugs(cartItems);
    if (slugs.length === 0) {
      setCatalogDetailsBySlug({});
      return;
    }

    try {
      setCatalogDetailsError(false);
      const details = await fetchCatalogItemDetails(slugs);
      setCatalogDetailsBySlug(details);
    } catch {
      setCatalogDetailsBySlug({});
      setCatalogDetailsError(true);
    }
  }

  function refresh() {
    const cartItems = getCartItems();
    setItems(cartItems);
    setTotal(getCartTotal());
    notifyCartChange();
    void loadSuggestions(cartItems);
    void loadCatalogDetails(cartItems);
  }

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !focusAssign || assignment.unassigned.length === 0) return;
    const timer = window.setTimeout(() => {
      assignSelectRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      assignSelectRef.current?.focus();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [ready, focusAssign, assignment.unassigned.length, firstUnassignedKey]);

  function handleRemove(key: string) {
    removeCartItem(key);
    syncHomeVisitPersonCount();
    refresh();
  }

  function suggestionHref(suggestion: CartSuggestion): string {
    if (suggestion.kind === "package" && suggestion.packageId) {
      return packageOfferHref(suggestion.packageId);
    }
    if (suggestion.catalogSlug) {
      return catalogOfferHref(suggestion.catalogSlug);
    }
    return "/";
  }

  if (!ready) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <p className={heroSubClassName}>Ładowanie…</p>
      </MobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <MobileShell showBack backFallback="/" noCta>
        <div className={emptyStateClassName}>
          <div className={emptyStateIconClassName} aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 6h15l-1.5 9h-12L6 6z" strokeLinejoin="round" />
              <path d="M6 6l-1-2H3" strokeLinecap="round" />
              <circle cx="9" cy="19" r="1.25" fill="currentColor" stroke="none" />
              <circle cx="17" cy="19" r="1.25" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h2 className={emptyStateTitleClassName}>Koszyk jest pusty</h2>
          <p className={emptyStateSubClassName}>Dodaj badanie lub pakiet — możesz wyszukać po nazwie albo skorzystać z pomocnika.</p>
          <button type="button" className={btnPrimaryClassName} onClick={() => router.push("/")}>
            Szukaj badań
          </button>
          <button type="button" className={btnWarmMtClassName} onClick={() => router.push("/wizard")}>
            Nie wiem — pomóż mi wybrać
          </button>
        </div>
      </MobileShell>
    );
  }

  const grouped = groupItemsByPatient(items, patients);
  const needsCheckoutData = patients.some((p, index) => patientNeedsCheckoutStep(p, index === 0));
  const order = getOrder();
  const nextStep = getNextCheckoutStep(order ?? undefined);
  const grandTotal = order ? getOrderGrandTotal(order) : total;

  let checkoutLabel =
    total != null
      ? checkoutStepLabel(nextStep, {
          total: nextStep === "checkout" ? (grandTotal ?? total) : total,
          includeTotal: nextStep === "checkout",
        })
      : "Uzupełnij ceny w koszyku";
  if (total != null && nextStep !== "checkout") {
    checkoutLabel = checkoutStepLabel(nextStep);
  }

  return (
    <MobileShell
      showBack
      backFallback="/"
      stickyFooter={
        <button
          type="button"
          className={btnPrimaryClassName}
          onClick={() => goToCheckout(router)}
          disabled={total == null || assignment.unassigned.length > 0}
        >
          {checkoutLabel}
        </button>
      }
    >
      <CheckoutProgress current="koszyk" />
      <h2 className={heroTitleCheckoutClassName}>Koszyk</h2>
      <p className={`hero-sub ${heroSubAfterProgressClassName}`}>{items.length} {items.length === 1 ? "pozycja" : "pozycje"}</p>

      {toast && (
        <p className={searchToastClassName} role="status" aria-live="polite">
          {toast}
        </p>
      )}

      {(focusAssign || assignment.unassigned.length > 0) && (
        <p className={cartAssignBannerClassName} role="status" aria-live="polite">
          {assignment.unassigned.length}{" "}
          {assignment.unassigned.length === 1 ? "pozycja wymaga" : "pozycje wymagają"} przypisania do
          osoby — wybierz z listy poniżej.
        </p>
      )}

      {needsCheckoutData && (
        <p className={`${cartAssignBannerClassName} ${cartAssignBannerWarnClassName}`}>
          Uzupełnij dane kontaktowe przed płatnością.{" "}
          <button type="button" className={checkoutLinkClassName} onClick={() => router.push("/dane")}>
            Przejdź do danych
          </button>
        </p>
      )}

      <div className={cartGroupsClassName}>
        {grouped.map((group) => (
          <section key={group.patientId} className={cartPatientGroupClassName}>
            <div className={cartPatientGroupHeadClassName}>
              <h3 className={cartPatientGroupTitleClassName}>{group.name}</h3>
              <span className={cartPatientGroupMetaClassName}>
                {group.items.length} {group.items.length === 1 ? "pozycja" : "pozycje"}
                {group.subtotal != null ? ` · ${group.subtotal} zł` : ""}
              </span>
            </div>
            <div className={cartPatientGroupItemsClassName}>
              {group.items.map((item) => (
                <CartLineItem
                  key={item.key}
                  item={item}
                  details={getCartItemDetails(item, catalogDetailsBySlug)}
                  patients={patients}
                  onRemove={handleRemove}
                  onPatientChange={refresh}
                  hidePatientSelector={group.patientId !== UNASSIGNED_PATIENT}
                  assignSelectRef={item.key === firstUnassignedKey ? assignSelectRef : undefined}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {catalogDetailsError && (
        <ApiErrorState
          message="Nie udało się załadować szczegółów pakietów w koszyku."
          onRetry={() => void loadCatalogDetails(items)}
        />
      )}

      <CartTotalBreakdown itemsTotal={total} order={order} />

      {(loadingSuggestions || suggestions.length > 0 || suggestionsError) && (
        <div className={cartSuggestionsClassName}>
          <h3 className={cartSuggestionsTitleClassName}>Polecane razem</h3>
          <p className={`hero-sub ${cartSuggestionsSubClassName}`}>
            Badania często dobierane do tego, co masz w koszyku
          </p>

          {suggestionsError && !loadingSuggestions && (
            <ApiErrorState
              message="Nie udało się załadować poleceń."
              onRetry={() => void loadSuggestions(items)}
            />
          )}

          {loadingSuggestions && suggestions.length === 0 && !suggestionsError && (
            <OfferCardSkeletonList count={2} />
          )}

          {!loadingSuggestions && suggestions.length > 0 && (
            <div className={offerCardListClassName}>
              {suggestions.map((suggestion) => (
                <OfferCard
                  key={suggestion.key}
                  href={suggestionHref(suggestion)}
                  name={suggestion.name}
                  typ={suggestion.typ ?? "pakiet"}
                  price={suggestion.price}
                  resultTime={suggestion.resultTime}
                  testCount={suggestion.testCount}
                  packageId={suggestion.packageId}
                  catalogSlug={suggestion.catalogSlug}
                  catalogId={suggestion.catalogId}
                  category={suggestion.reason}
                  onCartToast={(message) => {
                    setToast(message);
                    setTimeout(() => setToast(""), 1800);
                    refresh();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <button type="button" className={btnSecondaryMtClassName} onClick={() => router.push("/")}>
        + Szukaj innych badań
      </button>
    </MobileShell>
  );
}

export default function KoszykPage() {
  return (
    <Suspense
      fallback={
        <MobileShell showBack backFallback="/" noCta>
          <p className={heroSubClassName}>Ładowanie…</p>
        </MobileShell>
      }
    >
      <KoszykPageContent />
    </Suspense>
  );
}
