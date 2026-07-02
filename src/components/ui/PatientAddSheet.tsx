"use client";

import { btnPrimaryClassName, btnSecondaryClassName } from "@/components/ui/app-button-layout";
import { consentBoxClassName } from "@/components/ui/consent-box-layout";
import { useEffect, useState } from "react";
import { AppFullscreen } from "@/components/ui/AppFullscreen";
import {
  fullscreenBtnCancelClassName,
  fullscreenFooterActionsClassName,
} from "@/components/ui/app-fullscreen-layout";
import { PeselInput } from "@/components/ui/PeselInput";
import {
  ageCategoryForRelation,
  parseFullNameInput,
  validatePatientContact,
  validatePatientIdentity,
} from "@/lib/patient-onboarding";
import type { PatientOnboardingInput } from "@/lib/types";
import {
  fieldErrorTextClassName,
  fieldGroupClassName,
  fieldHintClassName,
  fieldInputClassName,
  formErrorAlertProps,
} from "@/components/ui/form-field-layout";
import { patientIdentityModeToggleClassName } from "@/components/ui/patient-form-layout";
import styles from "./PatientForm.module.css";

type PatientAddSheetProps = {
  open: boolean;
  variant: "first" | "additional";
  onSubmit: (input: PatientOnboardingInput) => void;
  onClose: () => void;
  submitLabel?: string;
};

export function PatientAddSheet({
  open,
  variant,
  onSubmit,
  onClose,
  submitLabel,
}: PatientAddSheetProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [pesel, setPesel] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [useBirthDate, setUseBirthDate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setFullName("");
      setEmail("");
      setPhone("");
      setConsent(false);
      setPesel("");
      setBirthDate("");
      setUseBirthDate(false);
      setError("");
    }
  }, [open]);

  function handleSubmit() {
    const { firstName, lastName } = parseFullNameInput(fullName);
    const relation = variant === "additional" ? "other" : "self";

    const validationError = validatePatientIdentity(firstName, lastName, {
      identityMode: useBirthDate ? "birthDate" : "pesel",
      pesel,
      birthDate,
      relation,
      ageCategory: ageCategoryForRelation(relation, "child_4_12"),
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    if (variant === "first") {
      const contactError = validatePatientContact(email, consent);
      if (contactError) {
        setError(contactError);
        return;
      }
    }

    onSubmit({
      relation,
      firstName,
      lastName,
      pesel: useBirthDate ? "" : pesel,
      birthDate: useBirthDate ? birthDate : undefined,
      ageCategory: ageCategoryForRelation(relation, "child_4_12"),
      email: variant === "first" ? email.trim().toLowerCase() : undefined,
      phone: variant === "first" ? phone.trim() || undefined : undefined,
      consent: variant === "first" ? consent : undefined,
    });
  }

  const title = variant === "first" ? "Dane osoby" : "Nowa osoba";
  const subtitle =
    variant === "first"
      ? "Imię, PESEL i e-mail — potem dodasz badania bez ponownego pytania."
      : "Imię, nazwisko i PESEL lub data urodzenia.";
  const actionLabel = submitLabel ?? (variant === "first" ? "Zapisz" : "Dodaj osobę");

  const formClassName = [styles.form, styles.fields, variant === "first" ? styles.formFull : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <AppFullscreen
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      wide={variant === "first"}
      footer={
        <div className={fullscreenFooterActionsClassName}>
          <button type="button" className={`${btnSecondaryClassName} ${fullscreenBtnCancelClassName}`} onClick={onClose}>
            Anuluj
          </button>
          <button type="button" className={btnPrimaryClassName} onClick={handleSubmit}>
            {actionLabel}
          </button>
        </div>
      }
    >
      <form
        className={formClassName}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Tożsamość</p>

          <div className={fieldGroupClassName}>
            <label htmlFor="patientFullName" className={styles.label}>
              Imię i nazwisko
            </label>
            <input
              id="patientFullName"
              className={fieldInputClassName(
                Boolean(error && (error.includes("imię") || error.includes("nazwisko"))),
              )}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError("");
              }}
              placeholder="np. Anna Kowalska"
              autoComplete="name"
            />
          </div>

          {useBirthDate ? (
            <div className={fieldGroupClassName}>
              <label htmlFor="patientBirthDate" className={styles.label}>
                Data urodzenia
              </label>
              <input
                id="patientBirthDate"
                type="date"
                className={fieldInputClassName(error.includes("urodzenia"))}
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError("");
                }}
              />
              <button
                type="button"
                className={patientIdentityModeToggleClassName}
                onClick={() => {
                  setUseBirthDate(false);
                  setBirthDate("");
                  setError("");
                }}
              >
                Mam numer PESEL
              </button>
            </div>
          ) : (
            <div className={fieldGroupClassName}>
              <label htmlFor="patientPesel" className={styles.label}>
                Numer PESEL
              </label>
              <PeselInput
                id="patientPesel"
                value={pesel}
                onChange={(value) => {
                  setPesel(value);
                  setError("");
                }}
                error={error.includes("PESEL") ? error : undefined}
                hint="11 cyfr"
              />
              <button
                type="button"
                className={patientIdentityModeToggleClassName}
                onClick={() => {
                  setUseBirthDate(true);
                  setPesel("");
                  setError("");
                }}
              >
                Nie mam numeru PESEL
              </button>
            </div>
          )}
        </div>

        {variant === "first" && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Kontakt</p>

            <div className={fieldGroupClassName}>
              <label htmlFor="patientEmail" className={styles.label}>
                E-mail
              </label>
              <input
                id="patientEmail"
                type="email"
                className={fieldInputClassName(error.includes("e-mail"))}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="anna@email.pl"
                autoComplete="email"
              />
            </div>

            <div className={fieldGroupClassName}>
              <label htmlFor="patientPhone" className={styles.label}>
                Telefon <span className={fieldHintClassName}>(opcjonalnie)</span>
              </label>
              <input
                id="patientPhone"
                type="tel"
                className={fieldInputClassName()}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+48 600 000 000"
                autoComplete="tel"
              />
            </div>

            <div className={`${consentBoxClassName} ${styles.consent}`}>
              <label>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setError("");
                  }}
                />
                <span>
                  Wyrażam zgodę na przetwarzanie danych osobowych, w tym numeru PESEL lub daty
                  urodzenia, w celu realizacji zamówienia badań laboratoryjnych.
                </span>
              </label>
            </div>
          </div>
        )}

        {error &&
          !error.includes("PESEL") &&
          !error.includes("urodzenia") &&
          !error.includes("imię") &&
          !error.includes("nazwisko") && (
            <p className={`${fieldErrorTextClassName} ${styles.formError}`} {...formErrorAlertProps}>
              {error}
            </p>
          )}
        {error.includes("urodzenia") && (
          <p className={`${fieldErrorTextClassName} ${styles.formError}`} {...formErrorAlertProps}>
            {error}
          </p>
        )}
      </form>
    </AppFullscreen>
  );
}
