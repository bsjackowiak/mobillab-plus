"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { cartAssignmentsComplete, cartNeedsAssignment, updateCartItemPatient } from "@/lib/cart-patients";
import { orderHasCollection } from "@/lib/collection";
import { getCartItems } from "@/lib/cart";
import { orderHasItem } from "@/lib/order-helpers";
import { getOrder } from "@/lib/order-storage";
import { formatPeselInput, isValidPesel } from "@/lib/pesel";
import {
  createPatientId,
  getContactPatient,
  getPatients,
  getRequiredPatientCount,
  savePatients,
} from "@/lib/patient-storage";
import type { CartItem, PatientProfile } from "@/lib/types";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  pesel: string;
  consent: boolean;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validatePerson(form: FormState, isContactPerson: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (form.fullName.trim().length < 3) {
    errors.fullName = "Podaj imię i nazwisko";
  }
  if (isContactPerson && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Podaj poprawny adres e-mail";
  }
  if (!isValidPesel(form.pesel)) {
    errors.pesel = "Nieprawidłowy numer PESEL";
  }
  if (!form.consent) {
    errors.consent = "Wymagana zgoda na przetwarzanie danych";
  }

  return errors;
}

function emptyForm(): FormState {
  return { fullName: "", email: "", phone: "", pesel: "", consent: false };
}

function DanePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phase = searchParams.get("phase");

  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const order = getOrder();
  const requiredCount = getRequiredPatientCount(order);
  const isAssignPhase = phase === "assign";
  const nextPersonIndex = patients.length;
  const isContactPerson = nextPersonIndex === 0;

  useEffect(() => {
    const currentOrder = getOrder();
    if (!orderHasItem(currentOrder)) {
      router.replace("/");
      return;
    }

    const saved = getPatients();
    setPatients(saved);
    setItems(getCartItems());

    if (isAssignPhase) {
      const initial: Record<string, string> = {};
      for (const item of getCartItems()) {
        initial[item.key] = item.patientId ?? saved[0]?.id ?? "";
      }
      setAssignments(initial);
    } else if (saved[nextPersonIndex]) {
      const p = saved[nextPersonIndex]!;
      setForm({
        fullName: p.fullName,
        email: p.email,
        phone: p.phone ?? "",
        pesel: p.pesel,
        consent: true,
      });
    } else if (saved[0] && nextPersonIndex > 0) {
      setForm({
        ...emptyForm(),
        email: saved[0].email,
        phone: saved[0].phone ?? "",
      });
    }

    setReady(true);
  }, [router, isAssignPhase, nextPersonIndex]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function continueAfterPatients(updatedPatients: PatientProfile[]) {
    const currentOrder = getOrder();
    if (!orderHasCollection(currentOrder)) {
      router.push("/pobranie");
      return;
    }
    const needsAssign =
      updatedPatients.length > 1 &&
      (cartNeedsAssignment(currentOrder) || !cartAssignmentsComplete(currentOrder));
    if (needsAssign) {
      router.push("/dane?phase=assign");
      return;
    }
    router.push("/checkout");
  }

  function handlePersonSubmit() {
    const nextErrors = validatePerson(form, isContactPerson);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const contact = getContactPatient();
    const patient: PatientProfile = {
      id: patients[nextPersonIndex]?.id ?? createPatientId(),
      fullName: form.fullName.trim(),
      email: isContactPerson ? form.email.trim().toLowerCase() : (contact?.email ?? form.email.trim()),
      phone: isContactPerson ? form.phone.trim() || undefined : contact?.phone,
      pesel: form.pesel,
    };

    const updated = [...patients];
    updated[nextPersonIndex] = patient;
    savePatients(updated);
    setPatients(updated);
    setForm(emptyForm());
    setErrors({});

    if (updated.length < requiredCount) {
      setForm({
        ...emptyForm(),
        email: updated[0]?.email ?? "",
        phone: updated[0]?.phone ?? "",
      });
      return;
    }

    continueAfterPatients(updated);
  }

  function handleAssignmentSubmit() {
    const activePatients = patients.slice(0, requiredCount);
    for (const item of items) {
      const patientId = assignments[item.key];
      if (!patientId) {
        return;
      }
      updateCartItemPatient(item.key, patientId);
    }
    router.push("/checkout");
  }

  if (!ready) {
    return (
      <MobileShell showBack backFallback="/koszyk" noCta>
        <p className="hero-sub">Ładowanie…</p>
      </MobileShell>
    );
  }

  if (isAssignPhase) {
    const activePatients = patients.slice(0, requiredCount);
    const allAssigned = items.every((item) => assignments[item.key]);

    return (
      <MobileShell
        showBack
        backFallback="/pobranie"
        stickyFooter={
          <button
            type="button"
            className="btn-primary"
            onClick={handleAssignmentSubmit}
            disabled={!allAssigned}
          >
            Dalej do płatności
          </button>
        }
      >
        <h2 className="hero-title-checkout">Przypisz badania</h2>
        <p className="hero-sub">Wybierz, kto wykonuje które badanie</p>

        {items.map((item) => (
          <div key={item.key} className="assign-row">
            <div className="assign-row-main">
              <strong>{item.name}</strong>
              <span>{item.price != null ? `${item.price} zł` : "—"}</span>
            </div>
            <select
              className="field-input assign-select"
              value={assignments[item.key] ?? ""}
              onChange={(e) =>
                setAssignments((prev) => ({ ...prev, [item.key]: e.target.value }))
              }
            >
              <option value="">Wybierz osobę</option>
              {activePatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>
        ))}
      </MobileShell>
    );
  }

  const personLabel =
    requiredCount > 1
      ? `Osoba ${nextPersonIndex + 1} z ${requiredCount}`
      : "Twoje dane";

  return (
    <MobileShell
      showBack
      backFallback="/koszyk"
      stickyFooter={
        <button type="button" className="btn-primary" onClick={handlePersonSubmit}>
          {nextPersonIndex + 1 < requiredCount ? "Dalej — następna osoba" : "Dalej"}
        </button>
      }
    >
      <h2 className="hero-title-checkout">{personLabel}</h2>
      <p className="hero-sub">
        {requiredCount > 1 && !isContactPerson
          ? "Dane osoby wykonującej badania. Kontakt e-mail zostaje z pierwszej osoby."
          : patients.length > 0
            ? "Dane zapisane na tym urządzeniu — możesz je edytować."
            : "Potrzebne do rejestracji badań w laboratorium."}
      </p>

      <div className="form-stack">
        <div className="field-group">
          <label className="field-label" htmlFor="fullName">
            Imię i nazwisko
          </label>
          <input
            id="fullName"
            className={`field-input${errors.fullName ? " field-error" : ""}`}
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            autoComplete="name"
            placeholder="Anna Kowalska"
          />
          {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
        </div>

        {isContactPerson && (
          <div className="field-group">
            <label className="field-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className={`field-input${errors.email ? " field-error" : ""}`}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              placeholder="anna@email.pl"
            />
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>
        )}

        <div className="field-group">
          <label className="field-label" htmlFor="pesel">
            PESEL
          </label>
          <input
            id="pesel"
            inputMode="numeric"
            className={`field-input${errors.pesel ? " field-error" : ""}`}
            value={form.pesel}
            onChange={(e) => updateField("pesel", formatPeselInput(e.target.value))}
            autoComplete="off"
            placeholder="11 cyfr"
            maxLength={11}
          />
          <span className="field-hint">Wymagany do zlecenia badań w laboratorium</span>
          {errors.pesel && <span className="field-error-text">{errors.pesel}</span>}
        </div>

        {isContactPerson && (
          <div className="field-group">
            <label className="field-label" htmlFor="phone">
              Telefon <span className="field-hint">(opcjonalnie)</span>
            </label>
            <input
              id="phone"
              type="tel"
              className="field-input"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              autoComplete="tel"
              placeholder="+48 600 000 000"
            />
          </div>
        )}

        <div className="consent-box">
          <label>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
            />
            <span>
              Wyrażam zgodę na przetwarzanie danych osobowych, w tym numeru PESEL, w celu
              realizacji zamówienia badań laboratoryjnych.
            </span>
          </label>
          {errors.consent && <span className="field-error-text">{errors.consent}</span>}
        </div>
      </div>
    </MobileShell>
  );
}

export default function PatientDataPage() {
  return (
    <Suspense
      fallback={
        <MobileShell showBack backFallback="/koszyk" noCta>
          <p className="hero-sub">Ładowanie…</p>
        </MobileShell>
      }
    >
      <DanePageContent />
    </Suspense>
  );
}
