"use client";

import { AppFullscreen } from "@/components/ui/AppFullscreen";
import {
  fullscreenOptionActionsClassName,
  fullscreenOptionCardClassName,
  fullscreenOptionClassName,
  fullscreenOptionCopyClassName,
  fullscreenOptionIconBtnClassName,
  fullscreenOptionIconBtnDangerClassName,
  fullscreenOptionNameClassName,
  fullscreenOptionNewClassName,
  fullscreenOptionSelectClassName,
  fullscreenOptionSubClassName,
  fullscreenOptionsClassName,
} from "@/components/ui/app-fullscreen-layout";
import { formatPatientIdentityMeta } from "@/lib/patient-identity";
import { patientShortLabel } from "@/lib/patient-onboarding";
import type { PatientProfile } from "@/lib/types";

type PatientPickerSheetProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  patients: PatientProfile[];
  onSelect: (patientId: string) => void;
  onClose: () => void;
  onAddNew?: () => void;
  onEdit?: (patientId: string) => void;
  onRemove?: (patientId: string) => void;
  canRemove?: (patientId: string) => boolean;
  addNewLabel?: string;
};

function displayName(patient: PatientProfile, index: number): string {
  const name = patient.fullName.trim();
  if (name.length >= 3) return name;
  return patientShortLabel(patient, index);
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinejoin="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M8 6V4h8v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
      <path d="M6 6l1 14h10l1-14" strokeLinejoin="round" />
    </svg>
  );
}

export function PatientPickerSheet({
  open,
  title = "Dla kogo dodać?",
  subtitle = "Wybierz osobę wykonującą to badanie",
  patients,
  onSelect,
  onClose,
  onAddNew,
  onEdit,
  onRemove,
  canRemove,
  addNewLabel = "+ Dodaj nową osobę",
}: PatientPickerSheetProps) {
  return (
    <AppFullscreen open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <div className={fullscreenOptionsClassName}>
        {patients.map((patient, index) => (
          <div
            key={patient.id}
            className={`${fullscreenOptionClassName} ${fullscreenOptionCardClassName}`}
          >
            <button
              type="button"
              className={fullscreenOptionSelectClassName}
              onClick={() => onSelect(patient.id)}
            >
              <span className={fullscreenOptionCopyClassName}>
                <span className={fullscreenOptionNameClassName}>{displayName(patient, index)}</span>
                <span className={fullscreenOptionSubClassName}>
                  {formatPatientIdentityMeta(patient)}
                  {index === 0 && patients.length > 1 ? " · kontakt" : ""}
                </span>
              </span>
            </button>
            {(onEdit || (onRemove && canRemove?.(patient.id))) && (
              <div className={fullscreenOptionActionsClassName}>
                {onEdit && (
                  <button
                    type="button"
                    className={fullscreenOptionIconBtnClassName}
                    onClick={() => onEdit(patient.id)}
                    aria-label={`Edytuj ${displayName(patient, index)}`}
                  >
                    <EditIcon />
                  </button>
                )}
                {onRemove && canRemove?.(patient.id) && (
                  <button
                    type="button"
                    className={`${fullscreenOptionIconBtnClassName} ${fullscreenOptionIconBtnDangerClassName}`}
                    onClick={() => onRemove(patient.id)}
                    aria-label={`Usuń ${displayName(patient, index)}`}
                  >
                    <DeleteIcon />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {onAddNew && (
          <button
            type="button"
            className={`${fullscreenOptionClassName} ${fullscreenOptionNewClassName}`}
            onClick={onAddNew}
          >
            <span className={fullscreenOptionNameClassName}>{addNewLabel}</span>
          </button>
        )}
      </div>
    </AppFullscreen>
  );
}
