"use client";

import { btnPrimaryClassName } from "@/components/ui/app-button-layout";
import { useEffect, useState } from "react";
import { AppFullscreen } from "@/components/ui/AppFullscreen";
import { PeselInput } from "@/components/ui/PeselInput";
import { splitFullName, validatePatientIdentity } from "@/lib/patient-onboarding";
import { patientIdentityMode } from "@/lib/patient-identity";
import type { PatientOnboardingInput, PatientProfile } from "@/lib/types";
import {
  fieldErrorTextClassName,
  fieldGroupClassName,
  fieldInputClassName,
} from "@/components/ui/form-field-layout";
import { patientIdentityModeToggleClassName } from "@/components/ui/patient-form-layout";
import styles from "./PatientForm.module.css";

type PatientEditSheetProps = {
  open: boolean;
  patient: PatientProfile | null;
  onSubmit: (input: Pick<PatientOnboardingInput, "firstName" | "lastName" | "pesel" | "birthDate">) => void;
  onClose: () => void;
};

export function PatientEditSheet({ open, patient, onSubmit, onClose }: PatientEditSheetProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pesel, setPesel] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [useBirthDate, setUseBirthDate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !patient) return;

    const { firstName: initialFirstName, lastName: initialLastName } = splitFullName(patient.fullName);
    const identityMode = patientIdentityMode(patient);

    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setUseBirthDate(identityMode === "birthDate");
    setPesel(identityMode === "pesel" ? patient.pesel : "");
    setBirthDate(patient.birthDate ?? "");
    setError("");
  }, [open, patient]);

  function handleSubmit() {
    const validationError = validatePatientIdentity(firstName, lastName, {
      identityMode: useBirthDate ? "birthDate" : "pesel",
      pesel,
      birthDate,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      pesel: useBirthDate ? "" : pesel,
      birthDate: useBirthDate ? birthDate : undefined,
    });
  }

  if (!patient) return null;

  return (
    <AppFullscreen
      open={open}
      onClose={onClose}
      title="Edytuj osobę"
      subtitle="Zaktualizuj dane osoby wykonującej badanie"
      footer={
        <button type="button" className={btnPrimaryClassName} onClick={handleSubmit}>
          Zapisz zmiany
        </button>
      }
    >
      <div className={styles.fields}>
        <div className={fieldGroupClassName}>
          <label htmlFor="editPatientFirstName" className={styles.label}>
            Imię
          </label>
          <input
            id="editPatientFirstName"
            className={fieldInputClassName(Boolean(error && firstName.trim().length < 2))}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError("");
            }}
            autoComplete="given-name"
          />
        </div>

        <div className={fieldGroupClassName}>
          <label htmlFor="editPatientLastName" className={styles.label}>
            Nazwisko
          </label>
          <input
            id="editPatientLastName"
            className={fieldInputClassName(Boolean(error && lastName.trim().length < 2))}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError("");
            }}
            autoComplete="family-name"
          />
        </div>

        {useBirthDate ? (
          <div className={fieldGroupClassName}>
            <label htmlFor="editPatientBirthDate" className={styles.label}>
              Data urodzenia
            </label>
            <input
              id="editPatientBirthDate"
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
            <label htmlFor="editPatientPesel" className={styles.label}>
              Numer PESEL
            </label>
            <PeselInput
              id="editPatientPesel"
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

        {error &&
          !error.includes("PESEL") &&
          !error.includes("urodzenia") && <span className={fieldErrorTextClassName}>{error}</span>}
        {error.includes("urodzenia") && <span className={fieldErrorTextClassName}>{error}</span>}
      </div>
    </AppFullscreen>
  );
}
