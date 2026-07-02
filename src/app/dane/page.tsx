"use client";

import { btnPrimaryClassName } from "@/components/ui/app-button-layout";
import { consentBoxClassName } from "@/components/ui/consent-box-layout";
import { formStackClassName } from "@/components/ui/form-stack-layout";
import { heroSubClassName, heroTitleCheckoutClassName, heroTitleClassName, heroTitleSmClassName, heroSubTightClassName } from "@/components/ui/page-hero-layout";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { CheckoutProgress } from "@/components/ui/CheckoutProgress";
import { heroSubAfterProgressClassName } from "@/components/ui/checkout-progress-layout";
import {
  patientCardClassNames,
  patientCardMainClassName,
  patientCardMetaClassName,
  patientCardNameClassName,
  patientCardRemoveClassName,
  patientIdentitySummaryClassName,
  patientListClassName,
} from "@/components/ui/patient-list-layout";
import { patientIdentityModeToggleClassName } from "@/components/ui/patient-form-layout";
import {
  fieldErrorTextClassName,
  fieldGroupClassName,
  fieldHintClassName,
  fieldInputClassName,
  fieldLabelClassName,
} from "@/components/ui/form-field-layout";
import { canRemovePatientByIndex, removePatientFully } from "@/lib/patient-actions";
import { checkoutStepHref, getNextCheckoutStep } from "@/lib/checkout-flow";
import { orderHasItem } from "@/lib/order-helpers";
import { getOrder } from "@/lib/order-storage";
import {
  formatPatientIdentityMeta,
  formatPatientIdentitySaved,
  patientIdentityMode,
} from "@/lib/patient-identity";
import {
  createPatientId,
  getContactPatient,
  getPatients,
  getRequiredPatientCount,
  hasRequiredPatients,
  patientHasCompleteData,
  patientNeedsCheckoutStep,
  savePatients,
} from "@/lib/patient-storage";
import { validatePatientContact, validatePatientIdentity } from "@/lib/patient-onboarding";
import type { PatientProfile } from "@/lib/types";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  pesel: string;
  birthDate: string;
  useBirthDate: boolean;
  consent: boolean;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validatePerson(
  form: FormState,
  isContactPerson: boolean,
  identityComplete: boolean,
  patient?: PatientProfile,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!identityComplete) {
    const [firstName = "", ...rest] = form.fullName.trim().split(" ");
    const lastName = rest.join(" ");
    const identityError = validatePatientIdentity(firstName, lastName, {
      identityMode: form.useBirthDate ? "birthDate" : "pesel",
      pesel: form.pesel,
      birthDate: form.birthDate,
      relation: isContactPerson ? (patient?.relation ?? "self") : (patient?.relation ?? "other"),
      ageCategory: patient?.ageCategory,
    });

    if (identityError?.includes("imię") || identityError?.includes("nazwisko")) {
      errors.fullName = identityError;
    } else if (identityError?.includes("PESEL") || identityError?.includes("Wiek")) {
      errors.pesel = identityError;
    } else if (identityError?.includes("urodzenia") || identityError?.includes("Wiek")) {
      errors.birthDate = identityError;
    } else if (identityError) {
      errors.fullName = identityError;
    }
  }

  if (isContactPerson) {
    const contactError = validatePatientContact(form.email, form.consent);
    if (contactError?.includes("e-mail")) errors.email = contactError;
    if (contactError?.includes("zgoda")) errors.consent = contactError;
  }

  return errors;
}

function emptyForm(): FormState {
  return {
    fullName: "",
    email: "",
    phone: "",
    pesel: "",
    birthDate: "",
    useBirthDate: false,
    consent: false,
  };
}

function formForIndex(index: number, saved: PatientProfile[]): FormState {
  const existing = saved[index];
  if (existing) {
    const useBirthDate = patientIdentityMode(existing) === "birthDate";
    const identityComplete = patientHasCompleteData(existing);
    return {
      fullName: existing.fullName,
      email: existing.email,
      phone: existing.phone ?? "",
      pesel: useBirthDate ? "" : existing.pesel,
      birthDate: existing.birthDate ?? "",
      useBirthDate,
      consent: identityComplete && Boolean(existing.email),
    };
  }
  if (index > 0 && saved[0]) {
    return {
      ...emptyForm(),
      email: saved[0].email,
      phone: saved[0].phone ?? "",
    };
  }
  return emptyForm();
}

function initialActiveIndex(saved: PatientProfile[], requiredCount: number): number {
  for (let i = 0; i < Math.max(requiredCount, saved.length); i += 1) {
    const patient = saved[i];
    if (!patient || patientNeedsCheckoutStep(patient, i === 0)) return i;
  }
  return 0;
}

function canRemovePatient(index: number, patientCount: number, requiredCount: number): boolean {
  return canRemovePatientByIndex(index, patientCount, requiredCount);
}

function continueAfterPatients(router: ReturnType<typeof useRouter>) {
  router.push(checkoutStepHref(getNextCheckoutStep()));
}

function DanePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const order = getOrder();
  const requiredCount = getRequiredPatientCount(order);
  const isContactPerson = activeIndex === 0;
  const activePatient = patients[activeIndex];
  const identityComplete = Boolean(activePatient && patientHasCompleteData(activePatient));

  useEffect(() => {
    const currentOrder = getOrder();
    if (!orderHasItem(currentOrder)) {
      router.replace("/");
      return;
    }

    const saved = getPatients();
    setPatients(saved);

    if (hasRequiredPatients(currentOrder)) {
      continueAfterPatients(router);
      return;
    }

    const indexParam = searchParams.get("index");
    const parsedIndex = indexParam ? Number.parseInt(indexParam, 10) : NaN;
    const index =
      !Number.isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < Math.max(requiredCount, saved.length)
        ? parsedIndex
        : initialActiveIndex(saved, requiredCount);
    setActiveIndex(index);
    setForm(formForIndex(index, saved));
    setReady(true);
  }, [router, requiredCount, searchParams]);

  function selectPatient(index: number) {
    setActiveIndex(index);
    setForm(formForIndex(index, patients));
    setErrors({});
  }

  function handleRemovePatient(index: number) {
    const patient = patients[index];
    if (!patient || !canRemovePatient(index, patients.length, requiredCount)) return;

    removePatientFully(patient.id);
    const updated = getPatients();
    setPatients(updated);
    setErrors({});

    const nextIndex = initialActiveIndex(updated, requiredCount);
    setActiveIndex(nextIndex);
    setForm(formForIndex(nextIndex, updated));
  }

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

  function handlePersonSubmit() {
    const nextErrors = validatePerson(form, isContactPerson, identityComplete, activePatient);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const contact = getContactPatient();
    const patient: PatientProfile = {
      id: patients[activeIndex]?.id ?? createPatientId(),
      fullName: identityComplete ? (activePatient?.fullName ?? form.fullName.trim()) : form.fullName.trim(),
      email: isContactPerson ? form.email.trim().toLowerCase() : (contact?.email ?? form.email.trim()),
      phone: isContactPerson ? form.phone.trim() || undefined : contact?.phone,
      pesel: identityComplete
        ? (activePatient?.pesel ?? "")
        : form.useBirthDate
          ? ""
          : form.pesel,
      birthDate: identityComplete
        ? activePatient?.birthDate
        : form.useBirthDate
          ? form.birthDate
          : undefined,
      relation: activePatient?.relation ?? (activeIndex === 0 ? "self" : "other"),
      ageCategory: activePatient?.ageCategory,
    };

    const updated = [...patients];
    updated[activeIndex] = patient;
    savePatients(updated);
    setPatients(updated);
    setErrors({});

    const allReady = updated
      .slice(0, requiredCount)
      .every((p, index) => p && !patientNeedsCheckoutStep(p, index === 0));

    if (!allReady || updated.length < requiredCount) {
      const nextIndex = initialActiveIndex(updated, requiredCount);
      setActiveIndex(nextIndex);
      setForm(formForIndex(nextIndex, updated));
      return;
    }

    continueAfterPatients(router);
  }

  if (!ready) {
    return (
      <MobileShell showBack backFallback="/koszyk" noCta>
        <p className={heroSubClassName}>Ładowanie…</p>
      </MobileShell>
    );
  }

  const personLabel =
    requiredCount > 1
      ? `Osoba ${activeIndex + 1} z ${requiredCount}`
      : isContactPerson && identityComplete
        ? "Dane kontaktowe"
        : "Twoje dane";

  const allReady = patients
    .slice(0, requiredCount)
    .every((p, index) => p && !patientNeedsCheckoutStep(p, index === 0));

  const footerLabel =
    allReady && patients.length >= requiredCount
      ? "Dalej"
      : activeIndex + 1 < requiredCount
        ? "Dalej — następna osoba"
        : "Zapisz i dalej";

  const nextStep = getNextCheckoutStep();
  const footerActionLabel =
    allReady && patients.length >= requiredCount
      ? nextStep === "pobranie"
        ? "Wybierz pobranie"
        : nextStep === "checkout"
          ? "Przejdź do płatności"
          : "Dalej"
      : footerLabel;

  return (
    <MobileShell
      showBack
      backFallback="/koszyk"
      stickyFooter={
        <button type="button" className={btnPrimaryClassName} onClick={handlePersonSubmit}>
          {footerActionLabel}
        </button>
      }
    >
      <CheckoutProgress current="dane" />
      <h2 className={heroTitleCheckoutClassName}>{personLabel}</h2>
      <p className={`hero-sub ${heroSubAfterProgressClassName}`}>
        {identityComplete && isContactPerson
          ? "Potwierdź e-mail i zgodę — dane osobowe są już zapisane."
          : identityComplete
            ? "Dane osoby są zapisane. Kontakt e-mail zostaje z pierwszej osoby."
            : requiredCount > 1 && !isContactPerson
              ? "Uzupełnij dane osoby wykonującej badania."
              : "Potrzebne do rejestracji badań w laboratorium."}
      </p>

      {patients.length > 1 && (
        <div className={patientListClassName}>
          {patients.slice(0, requiredCount).map((patient, index) => (
            <div key={patient.id} className={patientCardClassNames(index === activeIndex)}>
              <button
                type="button"
                className={patientCardMainClassName}
                onClick={() => selectPatient(index)}
              >
                <span className={patientCardNameClassName}>{patient.fullName}</span>
                <span className={patientCardMetaClassName}>
                  {index === 0 ? "Kontakt" : `Osoba ${index + 1}`} · {formatPatientIdentityMeta(patient)}
                </span>
              </button>
              {canRemovePatient(index, patients.length, requiredCount) && (
                <button
                  type="button"
                  className={patientCardRemoveClassName}
                  onClick={() => handleRemovePatient(index)}
                  aria-label={`Usuń ${patient.fullName}`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {identityComplete && activePatient && (
        <div className={patientIdentitySummaryClassName}>
          <strong>{activePatient.fullName}</strong>
          <span>{formatPatientIdentitySaved(activePatient)}</span>
        </div>
      )}

      <div className={formStackClassName}>
        {!identityComplete && (
          <>
            <div className={fieldGroupClassName}>
              <label className={fieldLabelClassName} htmlFor="fullName">
                Imię i nazwisko
              </label>
              <input
                id="fullName"
                className={fieldInputClassName(Boolean(errors.fullName))}
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                autoComplete="name"
                placeholder="Anna Kowalska"
              />
              {errors.fullName && <span className={fieldErrorTextClassName}>{errors.fullName}</span>}
            </div>

            {form.useBirthDate ? (
              <div className={fieldGroupClassName}>
                <label className={fieldLabelClassName} htmlFor="birthDate">
                  Data urodzenia
                </label>
                <input
                  id="birthDate"
                  type="date"
                  className={fieldInputClassName(Boolean(errors.birthDate))}
                  value={form.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                />
                {errors.birthDate && <span className={fieldErrorTextClassName}>{errors.birthDate}</span>}
                <button
                  type="button"
                  className={patientIdentityModeToggleClassName}
                  onClick={() => {
                    updateField("useBirthDate", false);
                    updateField("birthDate", "");
                  }}
                >
                  Mam numer PESEL
                </button>
              </div>
            ) : (
              <div className={fieldGroupClassName}>
                <label className={fieldLabelClassName} htmlFor="pesel">
                  PESEL
                </label>
                <input
                  id="pesel"
                  className={fieldInputClassName(Boolean(errors.pesel))}
                  value={form.pesel}
                  onChange={(e) => updateField("pesel", e.target.value.replace(/\D/g, "").slice(0, 11))}
                  inputMode="numeric"
                  placeholder="11 cyfr"
                />
                {errors.pesel && <span className={fieldErrorTextClassName}>{errors.pesel}</span>}
                <button
                  type="button"
                  className={patientIdentityModeToggleClassName}
                  onClick={() => {
                    updateField("useBirthDate", true);
                    updateField("pesel", "");
                  }}
                >
                  Nie mam numeru PESEL
                </button>
              </div>
            )}
          </>
        )}

        {isContactPerson && (
          <>
            <div className={fieldGroupClassName}>
              <label className={fieldLabelClassName} htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={fieldInputClassName(Boolean(errors.email))}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                autoComplete="email"
                placeholder="anna@email.pl"
              />
              {errors.email && <span className={fieldErrorTextClassName}>{errors.email}</span>}
            </div>

            <div className={fieldGroupClassName}>
              <label className={fieldLabelClassName} htmlFor="phone">
                Telefon <span className={fieldHintClassName}>(opcjonalnie)</span>
              </label>
              <input
                id="phone"
                type="tel"
                className={fieldInputClassName()}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                autoComplete="tel"
                placeholder="+48 600 000 000"
              />
            </div>

            <div className={consentBoxClassName}>
              <label>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => updateField("consent", e.target.checked)}
                />
                <span>
                  Wyrażam zgodę na przetwarzanie danych osobowych, w tym numeru PESEL lub daty
                  urodzenia, w celu realizacji zamówienia badań laboratoryjnych.
                </span>
              </label>
              {errors.consent && <span className={fieldErrorTextClassName}>{errors.consent}</span>}
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}

export default function PatientDataPage() {
  return (
    <Suspense
      fallback={
        <MobileShell showBack backFallback="/koszyk" noCta>
          <p className={heroSubClassName}>Ładowanie…</p>
        </MobileShell>
      }
    >
      <DanePageContent />
    </Suspense>
  );
}
