"use client";

import { AppButton } from "@/components/ui/AppButton";
import { heroSubClassName, heroTitleCheckoutClassName } from "@/components/ui/page-hero-layout";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  CheckoutPaymentNotice,
  checkoutPayButtonLabel,
  isCheckoutPayDisabled,
} from "@/components/checkout/CheckoutPaymentNotice";
import { CheckoutProgress } from "@/components/ui/CheckoutProgress";
import { checkoutPayErrorClassName } from "@/components/ui/checkout-layout";
import { CheckoutCartSummary } from "@/components/checkout/CheckoutCartSummary";
import { CheckoutCollectionSection } from "@/components/checkout/CheckoutCollectionSection";
import { CheckoutPatientsSection } from "@/components/checkout/CheckoutPatientsSection";
import { CheckoutInvoiceSection } from "@/components/checkout/CheckoutInvoiceSection";
import { useNipLookup } from "@/components/checkout/useNipLookup";
import { getCartItems } from "@/lib/cart";
import { cartAssignmentsComplete, groupItemsByPatient } from "@/lib/cart-patients";
import {
  collectionSummary,
  formatCollectionLocation,
  getCollectionFee,
  getOrderGrandTotal,
  orderHasCollection,
} from "@/lib/collection";
import { normalizeNip, validateInvoice, type InvoiceFieldErrors } from "@/lib/invoice";
import { orderHasItem } from "@/lib/order-helpers";
import type { CheckoutClientConfig } from "@/lib/payment-config";
import { generateOrderNumber, getOrder, saveOrder } from "@/lib/order-storage";
import { getPatients, getRequiredPatientCount, hasRequiredPatients } from "@/lib/patient-storage";
import { ensureSessionHydrated } from "@/lib/session-sync";
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
  const [paymentConfig, setPaymentConfig] = useState<CheckoutClientConfig>({
    mode: "demo",
    provider: null,
    liveReady: false,
  });
  const [demoAcknowledged, setDemoAcknowledged] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handleCompanyUpdate = useCallback((patch: Partial<InvoiceCompanyData>) => {
    setCompanyInvoice((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleFieldsClearErrors = useCallback((keys: Array<keyof InvoiceCompanyData>) => {
    setInvoiceErrors((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        delete next[key];
      }
      return next;
    });
  }, []);

  const {
    status: nipLookupStatus,
    hint: nipLookupHint,
    source: nipLookupSource,
    resetLookup,
    retry: retryNipLookup,
  } = useNipLookup({
    enabled: ready && invoiceType === "company",
    nip: companyInvoice.nip,
    onCompanyUpdate: handleCompanyUpdate,
    onFieldsClearErrors: handleFieldsClearErrors,
  });

  useEffect(() => {
    void fetch("/api/checkout/config")
      .then((res) => res.json())
      .then((data: CheckoutClientConfig) => setPaymentConfig(data))
      .catch(() => {
        setPaymentConfig({ mode: "demo", provider: null, liveReady: false });
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await ensureSessionHydrated();
      if (cancelled) return;

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
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready || !order || patients.length === 0) {
    return (
      <MobileShell showBack backFallback="/pobranie" noCta>
        <p className={heroSubClassName}>Ładowanie…</p>
      </MobileShell>
    );
  }

  const visit = collectionSummary(order);

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
      resetLookup();
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
    resetLookup();
    if (type === "personal" && !personalInvoice.fullName.trim() && patients[0]) {
      setPersonalInvoice((prev) => ({
        ...prev,
        fullName: patients[0]!.fullName.trim(),
      }));
    }
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
        <AppButton onClick={() => void handlePay()} disabled={payDisabled}>
          {paying ? "Przetwarzanie…" : checkoutPayButtonLabel(paymentConfig, grandTotal)}
        </AppButton>
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
        <p className={checkoutPayErrorClassName} role="alert" aria-live="assertive">
          {payError}
        </p>
      )}

      <CheckoutCartSummary
        items={items}
        grouped={grouped}
        collectionFee={collectionFee}
        grandTotal={grandTotal}
        onAddMore={() => router.push("/")}
      />

      <CheckoutCollectionSection
        title={visit.title}
        detail={visit.detail}
        onChange={() => router.push("/pobranie")}
      />

      <CheckoutPatientsSection patients={patients} onChange={() => router.push("/dane")} />

      <CheckoutInvoiceSection
        invoiceType={invoiceType}
        personalInvoice={personalInvoice}
        companyInvoice={companyInvoice}
        invoiceErrors={invoiceErrors}
        nipLookupStatus={nipLookupStatus}
        nipLookupHint={nipLookupHint}
        nipLookupSource={nipLookupSource}
        onSelectType={selectInvoiceType}
        onUpdatePersonal={updatePersonal}
        onUpdateCompany={updateCompany}
        onRetryNipLookup={retryNipLookup}
      />
    </MobileShell>
  );
}
