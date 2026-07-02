"use client";

import { btnPrimaryClassName } from "@/components/ui/app-button-layout";
import { chipClassNames } from "@/components/ui/chip-layout";
import { heroSubClassName, heroTitleCheckoutClassName, heroTitleClassName, heroTitleSmClassName, heroSubTightClassName } from "@/components/ui/page-hero-layout";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  CheckoutPaymentNotice,
  checkoutPayButtonLabel,
  isCheckoutPayDisabled,
} from "@/components/checkout/CheckoutPaymentNotice";
import { CheckoutProgress } from "@/components/ui/CheckoutProgress";
import {
  checkoutBodyClassName,
  checkoutHeaderClassName,
  checkoutInvoiceBodyClassName,
  checkoutInvoiceChipsClassName,
  checkoutInvoiceFormClassName,
  checkoutInvoiceHintClassName,
  checkoutInvoiceRowClassName,
  checkoutLinkBlockClassName,
  checkoutLinkClassName,
  checkoutNipRetryLinkClassName,
  checkoutPatientGroupClassName,
  checkoutPatientLineClassName,
  checkoutPatientNameClassName,
  checkoutPayErrorClassName,
  checkoutRowClassName,
  checkoutRowNameClassName,
  checkoutSectionClassName,
  checkoutTotalInlineClassName,
} from "@/components/ui/checkout-layout";
import {
  fieldErrorTextClassName,
  fieldGroupClassName,
  fieldHintClassName,
  fieldHintSuccessClassName,
  fieldInputClassName,
  fieldLabelClassName,
} from "@/components/ui/form-field-layout";
import { getCartItems } from "@/lib/cart";
import { cartAssignmentsComplete, groupItemsByPatient } from "@/lib/cart-patients";
import {
  collectionSummary,
  formatCollectionLocation,
  getCollectionFee,
  getOrderGrandTotal,
  orderHasCollection,
} from "@/lib/collection";
import {
  formatNipInput,
  formatPostalCodeInput,
  isValidNip,
  normalizeNip,
  validateInvoice,
  type InvoiceFieldErrors,
} from "@/lib/invoice";
import { formatPatientIdentitySaved } from "@/lib/patient-identity";
import { orderHasItem } from "@/lib/order-helpers";
import type { CheckoutClientConfig } from "@/lib/payment-config";
import { generateOrderNumber, getOrder, saveOrder } from "@/lib/order-storage";
import { getPatients, getRequiredPatientCount, hasRequiredPatients } from "@/lib/patient-storage";
import type {
  CartItem,
  InvoiceCompanyData,
  InvoicePersonalData,
  InvoiceType,
  OrderState,
  PatientProfile,
} from "@/lib/types";

function emptyPersonalInvoice(contact?: PatientProfile): InvoicePersonalData {
  return {
    fullName: contact?.fullName?.trim() ?? "",
    address: "",
    postalCode: "",
    city: "",
  };
}

function emptyCompanyInvoice(): InvoiceCompanyData {
  return {
    companyName: "",
    nip: "",
    address: "",
    postalCode: "",
    city: "",
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [collectionFee, setCollectionFee] = useState(0);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [grouped, setGrouped] = useState<ReturnType<typeof groupItemsByPatient>>([]);
  const [invoiceType, setInvoiceType] = useState<InvoiceType | null>(null);
  const [personalInvoice, setPersonalInvoice] = useState<InvoicePersonalData>(emptyPersonalInvoice());
  const [companyInvoice, setCompanyInvoice] = useState<InvoiceCompanyData>(emptyCompanyInvoice());
  const [invoiceErrors, setInvoiceErrors] = useState<InvoiceFieldErrors>({});
  const [nipLookupStatus, setNipLookupStatus] = useState<
    "idle" | "loading" | "found" | "not_found" | "error"
  >("idle");
  const [nipLookupHint, setNipLookupHint] = useState<string | null>(null);
  const [nipLookupSource, setNipLookupSource] = useState<"regon" | "vat" | "ceidg" | null>(null);
  const [nipLookupRetry, setNipLookupRetry] = useState(0);
  const lastLookupAttemptRef = useRef<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<CheckoutClientConfig>({
    mode: "demo",
    provider: null,
    liveReady: false,
  });
  const [demoAcknowledged, setDemoAcknowledged] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/checkout/config")
      .then((res) => res.json())
      .then((data: CheckoutClientConfig) => setPaymentConfig(data))
      .catch(() => {
        setPaymentConfig({ mode: "demo", provider: null, liveReady: false });
      });
  }, []);

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
      router.replace("/koszyk?focus=assign");
      return;
    }

    const activePatients = getPatients().slice(0, getRequiredPatientCount(current));
    const cartItems = getCartItems();
    const contact = activePatients[0];

    setItems(cartItems);
    setOrder(current);
    setGrandTotal(getOrderGrandTotal(current!));
    setCollectionFee(getCollectionFee(current!.collectionType));
    setPatients(activePatients);
    setGrouped(groupItemsByPatient(cartItems, activePatients));
    setInvoiceType(current?.invoiceType ?? "none");
    setPersonalInvoice(current?.invoicePersonal ?? emptyPersonalInvoice(contact));
    setCompanyInvoice(current?.invoiceCompany ?? emptyCompanyInvoice());
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready || invoiceType !== "company") {
      setNipLookupStatus("idle");
      setNipLookupHint(null);
      setNipLookupSource(null);
      return;
    }

    const nip = normalizeNip(companyInvoice.nip);
    if (!isValidNip(nip)) {
      setNipLookupStatus("idle");
      setNipLookupHint(null);
      setNipLookupSource(null);
      lastLookupAttemptRef.current = null;
      return;
    }

    if (lastLookupAttemptRef.current === nip) return;

    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        lastLookupAttemptRef.current = nip;
        setNipLookupStatus("loading");
        setNipLookupHint(null);
        try {
          const response = await fetch(`/api/nip-lookup?nip=${encodeURIComponent(nip)}`);
          const data = (await response.json()) as {
            companyName?: string;
            address?: string;
            postalCode?: string;
            city?: string;
            source?: "regon" | "vat" | "ceidg";
            hint?: string;
          };
          if (cancelled) return;

          if (!response.ok) {
            setNipLookupStatus(response.status === 404 ? "not_found" : "error");
            setNipLookupHint(data.hint ?? null);
            setNipLookupSource(null);
            return;
          }

          setCompanyInvoice((prev) => ({
            ...prev,
            companyName: data.companyName ?? prev.companyName,
            address: data.address ?? prev.address,
            postalCode: data.postalCode ?? prev.postalCode,
            city: data.city ?? prev.city,
          }));
          setInvoiceErrors((prev) => {
            const next = { ...prev };
            delete next.companyName;
            delete next.address;
            delete next.postalCode;
            delete next.city;
            return next;
          });
          setNipLookupStatus("found");
          setNipLookupSource(data.source ?? "vat");
          setNipLookupHint(null);
        } catch {
          if (!cancelled) {
            setNipLookupStatus("error");
            setNipLookupHint(null);
            setNipLookupSource(null);
          }
        }
      })();
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, invoiceType, companyInvoice.nip, nipLookupRetry]);

  if (!ready || !order || patients.length === 0) {
    return (
      <MobileShell showBack backFallback="/pobranie" noCta>
        <p className={heroSubClassName}>Ładowanie…</p>
      </MobileShell>
    );
  }

  const visit = collectionSummary(order);
  const multiPerson = patients.length > 1;

  function updatePersonal<K extends keyof InvoicePersonalData>(key: K, value: InvoicePersonalData[K]) {
    setPersonalInvoice((prev) => ({ ...prev, [key]: value }));
    if (invoiceErrors[key]) {
      setInvoiceErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function updateCompany<K extends keyof InvoiceCompanyData>(key: K, value: InvoiceCompanyData[K]) {
    setCompanyInvoice((prev) => ({ ...prev, [key]: value }));
    if (key === "nip") {
      lastLookupAttemptRef.current = null;
      setNipLookupStatus("idle");
      setNipLookupHint(null);
      setNipLookupSource(null);
    }
    if (invoiceErrors[key]) {
      setInvoiceErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function selectInvoiceType(type: InvoiceType) {
    setInvoiceType(type);
    setInvoiceErrors({});
    setNipLookupStatus("idle");
    setNipLookupHint(null);
    setNipLookupSource(null);
    lastLookupAttemptRef.current = null;
    if (type === "personal" && !personalInvoice.fullName.trim() && patients[0]) {
      setPersonalInvoice((prev) => ({
        ...prev,
        fullName: patients[0]!.fullName.trim(),
      }));
    }
  }

  function retryNipLookup() {
    lastLookupAttemptRef.current = null;
    setNipLookupRetry((count) => count + 1);
  }

  async function handlePay() {
    const current = getOrder();
    if (!orderHasItem(current) || grandTotal == null || !orderHasCollection(current)) return;

    const errors = validateInvoice(invoiceType, personalInvoice, companyInvoice);
    if (Object.keys(errors).length > 0) {
      setInvoiceErrors(errors);
      return;
    }

    setPayError(null);
    setPaying(true);

    try {
      const location = formatCollectionLocation(current!);
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          invoiceType: invoiceType!,
          invoicePersonal: invoiceType === "personal" ? personalInvoice : undefined,
          invoiceCompany:
            invoiceType === "company"
              ? { ...companyInvoice, nip: normalizeNip(companyInvoice.nip) }
              : undefined,
          location,
          demoAcknowledged: paymentConfig.mode === "demo" ? demoAcknowledged : undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        order?: OrderState;
        emailWarning?: string;
        accessToken?: string;
        redirectUrl?: string;
        paymentMode?: string;
      };

      if (!res.ok) {
        setPayError(data.error ?? "Nie udało się potwierdzić zamówienia");
        return;
      }

      if (data.order) {
        saveOrder(data.order);
        if (data.emailWarning) {
          sessionStorage.setItem("mobillab-email-warning", data.emailWarning);
        } else {
          sessionStorage.removeItem("mobillab-email-warning");
        }
      } else {
        saveOrder({
          orderNumber: generateOrderNumber(),
          location,
          invoiceType: invoiceType!,
          invoicePersonal: invoiceType === "personal" ? personalInvoice : undefined,
          invoiceCompany:
            invoiceType === "company"
              ? { ...companyInvoice, nip: normalizeNip(companyInvoice.nip) }
              : undefined,
          paymentStatus: "demo",
        });
      }

      if (data.accessToken) {
        sessionStorage.setItem("mobillab-order-token", data.accessToken);
      }

      if (data.paymentMode === "live" && typeof data.redirectUrl === "string") {
        if (data.redirectUrl.startsWith("http")) {
          window.location.assign(data.redirectUrl);
          return;
        }
        router.push(data.redirectUrl);
        return;
      }

      if (data.accessToken) {
        router.push(`/sukces/${data.accessToken}`);
        return;
      }

      router.push("/sukces");
    } catch {
      setPayError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setPaying(false);
    }
  }

  const payDisabled = isCheckoutPayDisabled(
    paymentConfig,
    grandTotal,
    invoiceType,
    demoAcknowledged,
    paying,
  );

  return (
    <MobileShell
      showBack
      backFallback="/pobranie"
      stickyFooter={
        <button type="button" className={btnPrimaryClassName} onClick={() => void handlePay()} disabled={payDisabled}>
          {paying ? "Przetwarzanie…" : checkoutPayButtonLabel(paymentConfig, grandTotal)}
        </button>
      }
    >
      <CheckoutProgress current="platnosc" />
      <h2 className={heroTitleCheckoutClassName}>Płatność</h2>

      <CheckoutPaymentNotice
        config={paymentConfig}
        demoAcknowledged={demoAcknowledged}
        onDemoAckChange={setDemoAcknowledged}
      />
      {payError && (
        <p className={checkoutPayErrorClassName} role="alert">
          {payError}
        </p>
      )}

      <div className={checkoutSectionClassName}>
        <div className={checkoutHeaderClassName}>
          <span>Twoje badania ({items.length})</span>
          <span className="check">✓</span>
        </div>
        <div className={checkoutBodyClassName}>
          {grouped.map((group) => (
            <div key={group.patientId} className={checkoutPatientGroupClassName}>
              <p className={checkoutPatientNameClassName}>
                {group.name}
                {group.subtotal != null ? ` · ${group.subtotal} zł` : ""}
              </p>
              {group.items.map((item) => (
                <div key={item.key} className={checkoutRowClassName}>
                  <span className={checkoutRowNameClassName}>{item.name}</span>
                  <strong>{item.price != null ? `${item.price} zł` : "—"}</strong>
                </div>
              ))}
            </div>
          ))}
          {collectionFee > 0 && (
            <div className={checkoutRowClassName}>
              <span>Pobranie w domu (jedna wizyta)</span>
              <strong>+{collectionFee} zł</strong>
            </div>
          )}
          <div className={checkoutTotalInlineClassName}>
            <span>Razem</span>
            <strong>{grandTotal != null ? `${grandTotal} zł` : "—"}</strong>
          </div>
          <button type="button" className={checkoutLinkBlockClassName} onClick={() => router.push("/")}>
            + Dodaj kolejne badanie lub pakiet
          </button>
        </div>
      </div>

      <div className={checkoutSectionClassName}>
        <div className={checkoutHeaderClassName}>
          <span>{visit.title}</span>
          <span className="check">✓</span>
        </div>
        <div className={checkoutBodyClassName}>
          {visit.detail} ·{" "}
          <button type="button" className={checkoutLinkClassName} onClick={() => router.push("/pobranie")}>
            Zmień
          </button>
        </div>
      </div>

      <div className={checkoutSectionClassName}>
        <div className={checkoutHeaderClassName}>
          <span>{multiPerson ? `Osoby (${patients.length})` : patients[0]!.fullName}</span>
          <span className="check">✓</span>
        </div>
        <div className={checkoutBodyClassName}>
          {multiPerson
            ? patients.map((p) => (
                <p key={p.id} className={checkoutPatientLineClassName}>
                  {p.fullName} · {formatPatientIdentitySaved(p)}
                </p>
              ))
            : `${patients[0]!.email} · ${formatPatientIdentitySaved(patients[0]!)}`}{" "}
          ·{" "}
          <button type="button" className={checkoutLinkClassName} onClick={() => router.push("/dane")}>
            Zmień
          </button>
        </div>
      </div>

      <div className={checkoutSectionClassName}>
        <div className={checkoutHeaderClassName}>
          <span>Faktura</span>
        </div>
        <div className={checkoutInvoiceBodyClassName}>
          <p className={`hero-sub ${checkoutInvoiceHintClassName}`}>
            Domyślnie możesz zapłacić bez faktury VAT. Wybierz inny rodzaj, jeśli potrzebujesz faktury.
          </p>

          <div className={checkoutInvoiceChipsClassName}>
            <button
              type="button"
              className={chipClassNames(invoiceType === "none")}
              onClick={() => selectInvoiceType("none")}
            >
              Bez faktury VAT
            </button>
            <button
              type="button"
              className={chipClassNames(invoiceType === "personal")}
              onClick={() => selectInvoiceType("personal")}
            >
              Faktura imienna
            </button>
            <button
              type="button"
              className={chipClassNames(invoiceType === "company")}
              onClick={() => selectInvoiceType("company")}
            >
              Faktura na firmę
            </button>
          </div>

          {invoiceType === "none" && (
            <p className={fieldHintClassName}>
              Nie musisz podawać danych do faktury — możesz przejść od razu do płatności.
            </p>
          )}

          {invoiceType === "personal" && (
            <div className={checkoutInvoiceFormClassName}>
              <div className={fieldGroupClassName}>
                <label className={fieldLabelClassName} htmlFor="invoiceFullName">
                  Imię i nazwisko
                </label>
                <input
                  id="invoiceFullName"
                  className={fieldInputClassName(Boolean(invoiceErrors.fullName))}
                  value={personalInvoice.fullName}
                  onChange={(e) => updatePersonal("fullName", e.target.value)}
                  autoComplete="name"
                />
                {invoiceErrors.fullName && (
                  <span className={fieldErrorTextClassName}>{invoiceErrors.fullName}</span>
                )}
              </div>

              <div className={fieldGroupClassName}>
                <label className={fieldLabelClassName} htmlFor="invoiceAddress">
                  Ulica i numer
                </label>
                <input
                  id="invoiceAddress"
                  className={fieldInputClassName(Boolean(invoiceErrors.address))}
                  value={personalInvoice.address}
                  onChange={(e) => updatePersonal("address", e.target.value)}
                  autoComplete="street-address"
                  placeholder="np. Marszałkowska 10/5"
                />
                {invoiceErrors.address && (
                  <span className={fieldErrorTextClassName}>{invoiceErrors.address}</span>
                )}
              </div>

              <div className={checkoutInvoiceRowClassName}>
                <div className={fieldGroupClassName}>
                  <label className={fieldLabelClassName} htmlFor="invoicePostalCode">
                    Kod pocztowy
                  </label>
                  <input
                    id="invoicePostalCode"
                    className={fieldInputClassName(Boolean(invoiceErrors.postalCode))}
                    value={personalInvoice.postalCode}
                    onChange={(e) => updatePersonal("postalCode", formatPostalCodeInput(e.target.value))}
                    inputMode="numeric"
                    placeholder="00-000"
                  />
                  {invoiceErrors.postalCode && (
                    <span className={fieldErrorTextClassName}>{invoiceErrors.postalCode}</span>
                  )}
                </div>

                <div className={fieldGroupClassName}>
                  <label className={fieldLabelClassName} htmlFor="invoiceCity">
                    Miejscowość
                  </label>
                  <input
                    id="invoiceCity"
                    className={fieldInputClassName(Boolean(invoiceErrors.city))}
                    value={personalInvoice.city}
                    onChange={(e) => updatePersonal("city", e.target.value)}
                    autoComplete="address-level2"
                  />
                  {invoiceErrors.city && <span className={fieldErrorTextClassName}>{invoiceErrors.city}</span>}
                </div>
              </div>
            </div>
          )}

          {invoiceType === "company" && (
            <div className={checkoutInvoiceFormClassName}>
              <div className={fieldGroupClassName}>
                <label className={fieldLabelClassName} htmlFor="invoiceNip">
                  NIP
                </label>
                <input
                  id="invoiceNip"
                  className={fieldInputClassName(Boolean(invoiceErrors.nip))}
                  value={companyInvoice.nip}
                  onChange={(e) => updateCompany("nip", formatNipInput(e.target.value))}
                  inputMode="numeric"
                  placeholder="000-000-00-00"
                  autoComplete="off"
                />
                {invoiceErrors.nip && <span className={fieldErrorTextClassName}>{invoiceErrors.nip}</span>}
                {nipLookupStatus === "loading" && (
                  <span className={fieldHintClassName}>Pobieranie danych firmy…</span>
                )}
                {nipLookupStatus === "found" && (
                  <span className={`${fieldHintClassName} ${fieldHintSuccessClassName}`}>
                    {nipLookupSource === "vat"
                      ? "Dane uzupełnione z rejestru VAT"
                      : nipLookupSource === "ceidg"
                        ? "Dane uzupełnione z bazy CEIDG"
                        : "Dane uzupełnione z rejestru GUS (REGON)"}
                  </span>
                )}
                {nipLookupStatus === "not_found" && (
                  <>
                    <span className={fieldHintClassName}>
                      Nie znaleziono firmy po tym NIP
                      {nipLookupHint ? ` — ${nipLookupHint}` : ""}.
                      Uzupełnij dane ręcznie.
                    </span>
                    <button type="button" className={checkoutNipRetryLinkClassName} onClick={retryNipLookup}>
                      Pobierz ponownie
                    </button>
                  </>
                )}
                {nipLookupStatus === "error" && (
                  <>
                    <span className={fieldHintClassName}>
                      Nie udało się pobrać danych — uzupełnij pola ręcznie lub spróbuj ponownie.
                    </span>
                    <button type="button" className={checkoutNipRetryLinkClassName} onClick={retryNipLookup}>
                      Pobierz ponownie
                    </button>
                  </>
                )}
              </div>

              <div className={fieldGroupClassName}>
                <label className={fieldLabelClassName} htmlFor="invoiceCompanyName">
                  Nazwa firmy
                </label>
                <input
                  id="invoiceCompanyName"
                  className={fieldInputClassName(Boolean(invoiceErrors.companyName))}
                  value={companyInvoice.companyName}
                  onChange={(e) => updateCompany("companyName", e.target.value)}
                  autoComplete="organization"
                />
                {invoiceErrors.companyName && (
                  <span className={fieldErrorTextClassName}>{invoiceErrors.companyName}</span>
                )}
              </div>

              <div className={fieldGroupClassName}>
                <label className={fieldLabelClassName} htmlFor="invoiceCompanyAddress">
                  Ulica i numer
                </label>
                <input
                  id="invoiceCompanyAddress"
                  className={fieldInputClassName(Boolean(invoiceErrors.address))}
                  value={companyInvoice.address}
                  onChange={(e) => updateCompany("address", e.target.value)}
                  autoComplete="street-address"
                  placeholder="np. Prosta 18"
                />
                {invoiceErrors.address && (
                  <span className={fieldErrorTextClassName}>{invoiceErrors.address}</span>
                )}
              </div>

              <div className={checkoutInvoiceRowClassName}>
                <div className={fieldGroupClassName}>
                  <label className={fieldLabelClassName} htmlFor="invoiceCompanyPostalCode">
                    Kod pocztowy
                  </label>
                  <input
                    id="invoiceCompanyPostalCode"
                    className={fieldInputClassName(Boolean(invoiceErrors.postalCode))}
                    value={companyInvoice.postalCode}
                    onChange={(e) => updateCompany("postalCode", formatPostalCodeInput(e.target.value))}
                    inputMode="numeric"
                    placeholder="00-000"
                  />
                  {invoiceErrors.postalCode && (
                    <span className={fieldErrorTextClassName}>{invoiceErrors.postalCode}</span>
                  )}
                </div>

                <div className={fieldGroupClassName}>
                  <label className={fieldLabelClassName} htmlFor="invoiceCompanyCity">
                    Miejscowość
                  </label>
                  <input
                    id="invoiceCompanyCity"
                    className={fieldInputClassName(Boolean(invoiceErrors.city))}
                    value={companyInvoice.city}
                    onChange={(e) => updateCompany("city", e.target.value)}
                    autoComplete="address-level2"
                  />
                  {invoiceErrors.city && <span className={fieldErrorTextClassName}>{invoiceErrors.city}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </MobileShell>
  );
}
