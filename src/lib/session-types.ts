import type { OrderState, PatientProfile } from "./types";

export type CompletedOrder = OrderState & {
  completedAt: string;
};

export type SessionData = {
  order: OrderState;
  patients: PatientProfile[];
  lastPatientId: string | null;
  completedOrders: CompletedOrder[];
  updatedAt: string;
};

export function emptySession(): SessionData {
  return {
    order: { items: [] },
    patients: [],
    lastPatientId: null,
    completedOrders: [],
    updatedAt: new Date(0).toISOString(),
  };
}
