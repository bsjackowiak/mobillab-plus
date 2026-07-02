"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addProductForPatient,
  canRegisterMorePatients,
  ensureContactPatient,
  getCompletePatientsForPicker,
  getProductKeyFromInput,
  isProductInCart,
  type AddProductInput,
  type AddToCartResult,
} from "@/lib/add-to-cart";
import { canRemovePatientById, removePatientFully } from "@/lib/patient-actions";
import { createAdditionalPatient, updatePatientProfile } from "@/lib/patient-onboarding";
import { getPatients } from "@/lib/patient-storage";
import { useActivePatient } from "@/lib/use-active-patient";
import { phoneAppRootClassName, phoneModalOpenClassName } from "@/components/layout/phone-frame-layout";
import { APP_PHONE_ID } from "@/components/layout/shell-integration";
import { useInert } from "@/lib/use-inert";
import type { PatientOnboardingInput } from "@/lib/types";

const PatientAddSheet = dynamic(
  () => import("@/components/ui/PatientAddSheet").then((m) => ({ default: m.PatientAddSheet })),
  { ssr: false },
);
const PatientEditSheet = dynamic(
  () => import("@/components/ui/PatientEditSheet").then((m) => ({ default: m.PatientEditSheet })),
  { ssr: false },
);
const PatientPickerSheet = dynamic(
  () => import("@/components/ui/PatientPickerSheet").then((m) => ({ default: m.PatientPickerSheet })),
  { ssr: false },
);

type RequestAddOptions = {
  onResult?: (result: AddToCartResult) => void;
};

type CartOverlayContextValue = {
  requestAdd: (input: AddProductInput, options?: RequestAddOptions) => AddToCartResult;
  openAddPatient: (options?: { onComplete?: (patientId: string) => void }) => void;
};

const CartOverlayContext = createContext<CartOverlayContextValue | null>(null);

export function CartOverlayProvider({ children }: { children: ReactNode }) {
  const { patients, activePatientId, setActivePatientId } = useActivePatient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [editPatientId, setEditPatientId] = useState<string | null>(null);
  const [pendingProduct, setPendingProduct] = useState<AddProductInput | null>(null);
  const pendingOnResultRef = useRef<((result: AddToCartResult) => void) | null>(null);
  const standaloneAddCallbackRef = useRef<((patientId: string) => void) | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const overlayOpen = pickerOpen || addPatientOpen || editPatientId != null;

  useInert(contentRef, overlayOpen);

  useEffect(() => {
    const phone = document.getElementById(APP_PHONE_ID);
    if (!phone) return;
    phone.classList.toggle(phoneModalOpenClassName, overlayOpen);
    return () => phone.classList.remove(phoneModalOpenClassName);
  }, [overlayOpen]);

  const emitResult = useCallback((result: AddToCartResult) => {
    if (
      result.status !== "needs-picker" &&
      result.status !== "needs-add-patient"
    ) {
      pendingOnResultRef.current?.(result);
      pendingOnResultRef.current = null;
    }
  }, []);

  const completePendingAdd = useCallback(
    (patientId?: string) => {
      if (!pendingProduct) return;
      const result = addProductForPatient(pendingProduct, { patientId });
      setPendingProduct(null);
      if (patientId) setActivePatientId(patientId);
      emitResult(result);
      return result;
    },
    [pendingProduct, setActivePatientId, emitResult],
  );

  const openAddPatientSheet = useCallback((product: AddProductInput | null) => {
    if (product) setPendingProduct(product);
    setPickerOpen(false);
    setAddPatientOpen(true);
  }, []);

  const requestAdd = useCallback(
    (input: AddProductInput, options?: RequestAddOptions): AddToCartResult => {
      pendingOnResultRef.current = options?.onResult ?? null;
      const result = addProductForPatient(input);

      if (result.status === "needs-add-patient") {
        openAddPatientSheet(input);
        return result;
      }
      if (result.status === "needs-picker") {
        setPendingProduct(input);
        setPickerOpen(true);
        return result;
      }

      emitResult(result);
      return result;
    },
    [emitResult, openAddPatientSheet],
  );

  const openAddPatient = useCallback((options?: { onComplete?: (patientId: string) => void }) => {
    standaloneAddCallbackRef.current = options?.onComplete ?? null;
    setPendingProduct(null);
    pendingOnResultRef.current = null;
    setAddPatientOpen(true);
  }, []);

  function closeAll() {
    setPickerOpen(false);
    setAddPatientOpen(false);
    setEditPatientId(null);
    setPendingProduct(null);
    pendingOnResultRef.current = null;
    standaloneAddCallbackRef.current = null;
  }

  function reopenPickerIfNeeded() {
    if (pendingProduct) setPickerOpen(true);
  }

  function handlePickerEdit(patientId: string) {
    setEditPatientId(patientId);
    setPickerOpen(false);
  }

  function handleEditClose() {
    setEditPatientId(null);
    reopenPickerIfNeeded();
  }

  function handleEditSubmit(input: Parameters<typeof updatePatientProfile>[1]) {
    if (editPatientId) {
      updatePatientProfile(editPatientId, input);
    }
    setEditPatientId(null);
    reopenPickerIfNeeded();
  }

  function handlePickerRemove(patientId: string) {
    const updated = removePatientFully(patientId);
    const remaining = getCompletePatientsForPicker(updated);
    if (remaining.length === 0 && pendingProduct) {
      setPickerOpen(false);
      const guest = ensureContactPatient();
      completePendingAdd(guest.id);
    }
  }

  function handlePickerSelect(patientId: string) {
    setPickerOpen(false);
    setActivePatientId(patientId);
    completePendingAdd(patientId);
  }

  function handlePickerAddNew() {
    if (!pendingProduct) return;
    openAddPatientSheet(pendingProduct);
  }

  function handleAdditionalPatientSubmit(input: PatientOnboardingInput) {
    const patient = createAdditionalPatient(input);
    setAddPatientOpen(false);
    if (pendingProduct) {
      completePendingAdd(patient.id);
      return;
    }
    setActivePatientId(patient.id);
    standaloneAddCallbackRef.current?.(patient.id);
    standaloneAddCallbackRef.current = null;
  }

  const currentPatients = patients.length > 0 ? patients : getPatients();
  const pickerPatients = getCompletePatientsForPicker(currentPatients);
  const pickerDuplicateFlow =
    pendingProduct != null && isProductInCart(getProductKeyFromInput(pendingProduct));

  const editPatient = editPatientId
    ? (currentPatients.find((patient) => patient.id === editPatientId) ?? null)
    : null;

  const value = useMemo(
    () => ({
      requestAdd,
      openAddPatient,
    }),
    [requestAdd, openAddPatient],
  );

  return (
    <CartOverlayContext.Provider value={value}>
      <div className={phoneAppRootClassName}>
        <div ref={contentRef}>{children}</div>
        <PatientAddSheet
          open={addPatientOpen}
          variant="additional"
          onSubmit={handleAdditionalPatientSubmit}
          onClose={closeAll}
          submitLabel={pendingProduct ? "Dodaj do koszyka" : undefined}
        />
        <PatientPickerSheet
          open={pickerOpen}
          title="Dla kogo dodać?"
          subtitle={
            pickerDuplicateFlow
              ? "To badanie jest już w koszyku — wybierz inną osobę lub dodaj nową"
              : "Wybierz osobę wykonującą to badanie"
          }
          patients={pickerPatients}
          onSelect={handlePickerSelect}
          onEdit={handlePickerEdit}
          onRemove={handlePickerRemove}
          canRemove={canRemovePatientById}
          onAddNew={canRegisterMorePatients(currentPatients) ? handlePickerAddNew : undefined}
          onClose={closeAll}
        />
        <PatientEditSheet
          open={editPatientId != null}
          patient={editPatient}
          onSubmit={handleEditSubmit}
          onClose={handleEditClose}
        />
      </div>
    </CartOverlayContext.Provider>
  );
}

export function useCartOverlay(): CartOverlayContextValue {
  const context = useContext(CartOverlayContext);
  if (!context) {
    throw new Error("useCartOverlay must be used within CartOverlayProvider");
  }
  return context;
}
