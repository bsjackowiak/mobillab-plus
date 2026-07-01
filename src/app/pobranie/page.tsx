"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  MAX_HOME_VISIT_PERSONS,
  TIME_SLOTS,
  formatCollectionLocation,
  getHomeVisitFee,
} from "@/lib/collection";
import { orderHasItem } from "@/lib/order-helpers";
import { cartAssignmentsComplete, cartNeedsAssignment } from "@/lib/cart-patients";
import { getOrder, saveOrder } from "@/lib/order-storage";
import { hasRequiredPatients } from "@/lib/patient-storage";
import { DEFAULT_FACILITY, FACILITIES, type Facility } from "@/lib/locations";
import { getPatients } from "@/lib/patient-storage";
import type { CollectionType } from "@/lib/types";

const PERSON_OPTIONS = Array.from({ length: MAX_HOME_VISIT_PERSONS }, (_, i) => i + 1);

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

    const order = getOrder();
    if (!hasRequiredPatients(order)) {
      router.push("/dane");
      return;
    }
    if (cartNeedsAssignment(order) || !cartAssignmentsComplete(order)) {
      router.push("/dane?phase=assign");
      return;
    }
    router.push("/checkout");
  }

  if (!ready) {
    return (
      <MobileShell showBack backFallback="/dane" noCta>
        <p className="hero-sub">Ładowanie…</p>
      </MobileShell>
    );
  }

  const homeFee = getHomeVisitFee();

  return (
    <MobileShell
      showBack
      backFallback="/dane"
      stickyFooter={
        <button type="button" className="btn-primary" onClick={handleContinue}>
          Dalej do płatności
        </button>
      }
    >
      <h2 className="hero-title-checkout">Gdzie pobrać krew?</h2>
      <p className="hero-sub">Wybierz punkt lub pobranie w domu</p>

      <div className="collection-modes">
        <button
          type="button"
          className={`collection-mode${collectionType === "facility" ? " selected" : ""}`}
          onClick={() => {
            setCollectionType("facility");
            setError("");
          }}
        >
          <span className="collection-mode-icon">🏥</span>
          <span className="collection-mode-title">Punkt pobrań</span>
          <span className="collection-mode-meta">W cenie badania</span>
        </button>
        <button
          type="button"
          className={`collection-mode${collectionType === "home" ? " selected" : ""}`}
          onClick={() => {
            setCollectionType("home");
            setError("");
          }}
        >
          <span className="collection-mode-icon">🏠</span>
          <span className="collection-mode-title">W domu</span>
          <span className="collection-mode-meta">+{homeFee} zł</span>
        </button>
      </div>

      {collectionType === "facility" ? (
        <>
          <p className="section-label collection-section-label">Punkt pobrań</p>
          <p className="hero-sub collection-hint">Przyjdź w godzinach otwarcia wybranego punktu</p>
          <div className="facility-list">
            {FACILITIES.map((f: Facility) => (
              <button
                key={f.id}
                type="button"
                className={`facility-pick${facilityId === f.id ? " selected" : ""}`}
                onClick={() => setFacilityId(f.id)}
              >
                <div className="facility-pick-main">
                  <strong>{f.name}</strong>
                  <span>
                    {f.address}, {f.city} · {f.distance}
                  </span>
                </div>
                <span className="facility-pick-rating">★ {f.rating}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="section-label collection-section-label">Dla ilu osób?</p>
          <p className="hero-sub collection-hint">
            Jedna wizyta, jeden dojazd — {homeFee} zł niezależnie od liczby osób
          </p>
          <div className="chips collection-chips">
            {PERSON_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={`chip${homeVisitPersonCount === n ? " chip-selected" : ""}`}
                onClick={() => setHomeVisitPersonCount(n)}
              >
                {n === 1 ? "1 osoba" : `${n} osoby`}
              </button>
            ))}
          </div>

          <p className="section-label collection-section-label">Termin wizyty</p>
          <div className="chips collection-chips">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip${slot === t ? " chip-selected" : ""}`}
                onClick={() => setSlot(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="section-label collection-section-label">Adres pobrania</p>
          <div className="field-group">
            <input
              id="homeAddress"
              className={`field-input${error ? " field-error" : ""}`}
              value={homeAddress}
              onChange={(e) => {
                setHomeAddress(e.target.value);
                setError("");
              }}
              placeholder="ul. Przykładowa 10/5, Warszawa"
              autoComplete="street-address"
            />
            {error && <span className="field-error-text">{error}</span>}
          </div>
          <div className="why-box">
            <h3>Pobranie w domu</h3>
            <p>
              Pielęgniarka przyjedzie pod wskazany adres. Opłata za dojazd: <strong>{homeFee} zł</strong> —
              płatne <strong>raz na wizytę</strong>, nawet gdy badania wykonują {homeVisitPersonCount}{" "}
              {homeVisitPersonCount === 1 ? "osoba" : "osoby"}.
            </p>
          </div>
        </>
      )}
    </MobileShell>
  );
}
