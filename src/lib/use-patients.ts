"use client";

import { useEffect, useState } from "react";
import { getPatients } from "@/lib/patient-storage";
import type { PatientProfile } from "@/lib/types";

export function usePatients() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);

  useEffect(() => {
    const refresh = () => setPatients(getPatients());
    refresh();
    window.addEventListener("labflow-patients", refresh);
    window.addEventListener("labflow-cart", refresh);
    return () => {
      window.removeEventListener("labflow-patients", refresh);
      window.removeEventListener("labflow-cart", refresh);
    };
  }, []);

  return patients;
}
