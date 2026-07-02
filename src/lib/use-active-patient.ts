"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDefaultPatientForAdd,
  getLastSelectedPatientId,
  getPatients,
  setLastSelectedPatientId,
} from "@/lib/patient-storage";
import type { PatientProfile } from "@/lib/types";

export function useActivePatient() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [activePatientId, setActivePatientIdState] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const list = getPatients();
    setPatients(list);

    const stored = getLastSelectedPatientId();
    const validStored = stored && list.some((p) => p.id === stored) ? stored : null;
    const next = validStored ?? list[0]?.id ?? null;
    setActivePatientIdState(next);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("labflow-patients", refresh);
    window.addEventListener("labflow-cart", refresh);
    return () => {
      window.removeEventListener("labflow-patients", refresh);
      window.removeEventListener("labflow-cart", refresh);
    };
  }, [refresh]);

  function setActivePatientId(patientId: string) {
    setLastSelectedPatientId(patientId);
    setActivePatientIdState(patientId);
    window.dispatchEvent(new Event("labflow-patients"));
  }

  const activePatient =
    patients.find((p) => p.id === activePatientId) ?? getDefaultPatientForAdd();

  return {
    patients,
    activePatientId: activePatient?.id ?? activePatientId,
    activePatient,
    setActivePatientId,
    refresh,
  };
}
