"use client";

import { chipClassNames } from "@/components/ui/chip-layout";
import { btnPrimaryClassName } from "@/components/ui/app-button-layout";
import { heroSubClassName, heroTitleCheckoutClassName } from "@/components/ui/page-hero-layout";
import {
  collectionChipsClassName,
  collectionFacilityListClassName,
  collectionFacilityPickClassName,
  collectionFacilityPickMainClassName,
  collectionFacilityPickRatingClassName,
  collectionHintClassName,
  collectionModeClassName,
  collectionModeIconClassName,
  collectionModeMetaClassName,
  collectionModesClassName,
  collectionModeTitleClassName,
  collectionSectionLabelClassName,
} from "@/components/ui/collection-page-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { CartTotalBreakdown } from "@/components/ui/CartTotalBreakdown";
import { CheckoutProgress } from "@/components/ui/CheckoutProgress";
import { heroSubAfterProgressClassName } from "@/components/ui/checkout-progress-layout";
import { contentBoxClassName } from "@/components/ui/content-box-layout";
import {
  fieldErrorTextClassName,
  fieldGroupClassName,
  fieldInputClassName,
} from "@/components/ui/form-field-layout";
import { getCartTotal } from "@/lib/cart";
import {
  TIME_SLOTS,
  formatCollectionLocation,
  getCollectionFee,
  getHomeVisitFee,
} from "@/lib/collection";
import { checkoutStepHref, checkoutStepLabel, getNextCheckoutStep } from "@/lib/checkout-flow";
import { orderHasItem } from "@/lib/order-helpers";
import { syncHomeVisitPersonCount } from "@/lib/cart-patients";
import { getOrder, saveOrder } from "@/lib/order-storage";
import { getPatients } from "@/lib/patient-storage";
import { DEFAULT_FACILITY, FACILITIES, type Facility } from "@/lib/locations";
import type { CollectionType } from "@/lib/types";

export default function PobraniePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [collectionType, setCollectionType] = useState<CollectionType>("facility");
  const [facilityId, setFacilityId] = useState(DEFAULT_FACILITY.id);
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [homeAddress, setHomeAddress] = useState("");
  const [homeVisitPersonCount, setHomeVisitPersonCount] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const order = getOrder();
    if (!orderHasItem(order)) {
      router.replace("/");
      return;
    }
    if (getPatients().length === 0) {
      router.replace("/dane");
      return;
    }

    if (order?.collectionType) setCollectionType(order.collectionType);
    if (order?.facilityId) setFacilityId(order.facilityId);
    if (order?.slot) setSlot(order.slot);
    if (order?.homeAddress) setHomeAddress(order.homeAddress);
    if (order?.homeVisitPersonCount) setHomeVisitPersonCount(order.homeVisitPersonCount);

    setReady(true);
  }, [router]);

  function handleContinue() {
    if (collectionType === "home" && homeAddress.trim().length < 5) {
      setError("Podaj adres pobrania w domu");
      return;
    }

    const location = formatCollectionLocation({
      collectionType,
      facilityId: collectionType === "facility" ? facilityId : undefined,
      homeAddress: collectionType === "home" ? homeAddress.trim() : undefined,
    });

    saveOrder({
      collectionType,
      facilityId: collectionType === "facility" ? facilityId : undefined,
      slot: collectionType === "home" ? slot : undefined,
      homeAddress: collectionType === "home" ? homeAddress.trim() : undefined,
      homeVisitPersonCount: collectionType === "home" ? homeVisitPersonCount : undefined,
      location,
    });

    syncHomeVisitPersonCount();
    router.push(checkoutStepHref(getNextCheckoutStep(getOrder())));
  }

  if (!ready) {
    return (
      <MobileShell showBack backFallback="/dane" noCta>
        <p className={heroSubClassName}>Ładowanie…</p>
      </MobileShell>
    );
  }

  const homeFee = getHomeVisitFee();
  const itemsTotal = getCartTotal();
  const grandTotalPreview =
    itemsTotal != null ? itemsTotal + getCollectionFee(collectionType) : null;
  const continueLabel =
    grandTotalPreview != null
      ? `Przejdź do płatności · ${grandTotalPreview} zł`
      : checkoutStepLabel(getNextCheckoutStep(getOrder()));

  return (
    <MobileShell
      showBack
      backFallback="/dane"
      stickyFooter={
        <button type="button" className={btnPrimaryClassName} onClick={handleContinue}>
          {continueLabel}
        </button>
      }
    >
      <CheckoutProgress current="pobranie" />
      <h2 className={heroTitleCheckoutClassName}>Gdzie pobrać krew?</h2>
      <p className={`${heroSubClassName} ${heroSubAfterProgressClassName}`}>Wybierz punkt lub pobranie w domu</p>

      <div className={collectionModesClassName}>
        <button
          type="button"
          className={collectionModeClassName(collectionType === "facility")}
          onClick={() => {
            setCollectionType("facility");
            setError("");
          }}
        >
          <span className={collectionModeIconClassName}>🏥</span>
          <span className={collectionModeTitleClassName}>Punkt pobrań</span>
          <span className={collectionModeMetaClassName}>W cenie badania</span>
        </button>
        <button
          type="button"
          className={collectionModeClassName(collectionType === "home")}
          onClick={() => {
            setCollectionType("home");
            setError("");
          }}
        >
          <span className={collectionModeIconClassName}>🏠</span>
          <span className={collectionModeTitleClassName}>W domu</span>
          <span className={collectionModeMetaClassName}>+{homeFee} zł</span>
        </button>
      </div>

      {collectionType === "facility" ? (
        <>
          <p className={collectionSectionLabelClassName}>Punkt pobrań</p>
          <p className={`${heroSubClassName} ${collectionHintClassName}`}>Przyjdź w godzinach otwarcia wybranego punktu</p>
          <div className={collectionFacilityListClassName}>
            {FACILITIES.map((f: Facility) => (
              <button
                key={f.id}
                type="button"
                className={collectionFacilityPickClassName(facilityId === f.id)}
                onClick={() => setFacilityId(f.id)}
              >
                <div className={collectionFacilityPickMainClassName}>
                  <strong>{f.name}</strong>
                  <span>
                    {f.address}, {f.city} · {f.distance}
                  </span>
                </div>
                <span className={collectionFacilityPickRatingClassName}>★ {f.rating}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className={collectionSectionLabelClassName}>Termin wizyty</p>
          <div className={collectionChipsClassName}>
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                className={chipClassNames(slot === t)}
                onClick={() => setSlot(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <p className={collectionSectionLabelClassName}>Adres pobrania</p>
          <div className={fieldGroupClassName}>
            <input
              id="homeAddress"
              className={fieldInputClassName(Boolean(error))}
              value={homeAddress}
              onChange={(e) => {
                setHomeAddress(e.target.value);
                setError("");
              }}
              placeholder="ul. Przykładowa 10/5, Warszawa"
              autoComplete="street-address"
            />
            {error && <span className={fieldErrorTextClassName}>{error}</span>}
          </div>
          <div className={contentBoxClassName}>
            <h3>Pobranie w domu</h3>
            <p>
              Pielęgniarka przyjedzie pod wskazany adres. Opłata za dojazd: <strong>{homeFee} zł</strong> —
              płatne <strong>raz na wizytę</strong>, nawet gdy badania wykonują {homeVisitPersonCount}{" "}
              {homeVisitPersonCount === 1 ? "osoba" : "osoby"}.
            </p>
          </div>
        </>
      )}

      <CartTotalBreakdown itemsTotal={itemsTotal} collectionType={collectionType} />
    </MobileShell>
  );
}
