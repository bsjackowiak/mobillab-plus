"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { getCartItems } from "@/lib/cart";
import { cartAssignmentsComplete, groupItemsByPatient } from "@/lib/cart-patients";
import {
  collectionSummary,
  formatCollectionLocation,
  getCollectionFee,
  getOrderGrandTotal,
  orderHasCollection,
} from "@/lib/collection";
import { orderHasItem } from "@/lib/order-helpers";
import { generateOrderNumber, getOrder, saveOrder } from "@/lib/order-storage";
import { getPatients, getRequiredPatientCount, hasRequiredPatients } from "@/lib/patient-storage";
import type { CartItem, OrderState, PatientProfile } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [collectionFee, setCollectionFee] = useState(0);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [grouped, setGrouped] = useState<ReturnType<typeof groupItemsByPatient>>([]);

  useEffect(() => {
    const current = getOrder();
    if (!orderHasItem(current)) {
      router.replace("/");
      return;
    }

    if (!hasRequiredPatients(current)) {
      router.replace("/dane");
      return;
    }

    if (!orderHasCollection(current)) {
      router.replace("/pobranie");
      return;
    }

    if (!cartAssignmentsComplete(current)) {
      router.replace("/dane?phase=assign");
      return;
    }

    const activePatients = getPatients().slice(0, getRequiredPatientCount(current));
    const cartItems = getCartItems();

    setItems(cartItems);
    setOrder(current);
    setGrandTotal(getOrderGrandTotal(current!));
    setCollectionFee(getCollectionFee(current!.collectionType));
    setPatients(activePatients);
    setGrouped(groupItemsByPatient(cartItems, activePatients));
    setReady(true);
  }, [router]);

  if (!ready || !order || patients.length === 0) {
    return (
      <MobileShell showBack backFallback="/pobranie" noCta>
        <p className="hero-sub">Ładowanie…</p>
      </MobileShell>
    );
  }

  const visit = collectionSummary(order);
  const multiPerson = patients.length > 1;

  function handlePay() {
    const current = getOrder();
    if (!orderHasItem(current) || grandTotal == null || !orderHasCollection(current)) return;
    saveOrder({
      orderNumber: generateOrderNumber(),
      location: formatCollectionLocation(current!),
    });
    router.push("/sukces");
  }

  return (
    <MobileShell
      showBack
      backFallback="/pobranie"
      stickyFooter={
        <button type="button" className="btn-primary" onClick={handlePay} disabled={grandTotal == null}>
          {grandTotal != null ? `Zapłać ${grandTotal} zł` : "Brak ceny"}
        </button>
      }
    >
      <h2 className="hero-title-checkout">Płatność</h2>

      <div className="checkout-section">
        <div className="checkout-header">
          <span>Twoje badania ({items.length})</span>
          <span className="check">✓</span>
        </div>
        <div className="checkout-body">
          {multiPerson
            ? grouped.map((group) => (
                <div key={group.patientId} className="checkout-patient-group">
                  <p className="checkout-patient-name">{group.name}</p>
                  {group.items.map((item) => (
                    <div key={item.key} className="checkout-row">
                      <span className="checkout-row-name">{item.name}</span>
                      <strong>{item.price != null ? `${item.price} zł` : "—"}</strong>
                    </div>
                  ))}
                </div>
              ))
            : items.map((item) => (
                <div key={item.key} className="checkout-row">
                  <span className="checkout-row-name">{item.name}</span>
                  <strong>{item.price != null ? `${item.price} zł` : "—"}</strong>
                </div>
              ))}
          {collectionFee > 0 && (
            <div className="checkout-row">
              <span>Pobranie w domu (jedna wizyta)</span>
              <strong>+{collectionFee} zł</strong>
            </div>
          )}
          <div className="checkout-row cart-total-inline">
            <span>Razem</span>
            <strong>{grandTotal != null ? `${grandTotal} zł` : "—"}</strong>
          </div>
          <button type="button" className="checkout-link checkout-link-block" onClick={() => router.push("/")}>
            + Dodaj kolejne badanie lub pakiet
          </button>
        </div>
      </div>

      <div className="checkout-section">
        <div className="checkout-header">
          <span>{visit.title}</span>
          <span className="check">✓</span>
        </div>
        <div className="checkout-body">
          {visit.detail} ·{" "}
          <button type="button" className="checkout-link" onClick={() => router.push("/pobranie")}>
            Zmień
          </button>
        </div>
      </div>

      <div className="checkout-section">
        <div className="checkout-header">
          <span>{multiPerson ? `Osoby (${patients.length})` : patients[0]!.fullName}</span>
          <span className="check">✓</span>
        </div>
        <div className="checkout-body">
          {multiPerson
            ? patients.map((p) => (
                <p key={p.id} className="checkout-patient-line">
                  {p.fullName} · PESEL zapisany
                </p>
              ))
            : `${patients[0]!.email} · PESEL zapisany`}{" "}
          ·{" "}
          <button type="button" className="checkout-link" onClick={() => router.push("/dane")}>
            Zmień
          </button>
        </div>
      </div>

      <div className="checkout-section">
        <div className="checkout-header">
          <span>Płatność</span>
        </div>
        <div className="checkout-body">
          <div className="pay-methods">
            <button type="button" className="pay-btn">
              Apple Pay
            </button>
            <button type="button" className="pay-btn blik">
              BLIK
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
