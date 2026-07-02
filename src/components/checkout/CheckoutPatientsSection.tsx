import {
  checkoutBodyClassName,
  checkoutHeaderClassName,
  checkoutLinkClassName,
  checkoutPatientLineClassName,
  checkoutSectionClassName,
} from "@/components/ui/checkout-layout";
import { formatPatientIdentitySaved } from "@/lib/patient-identity";
import type { PatientProfile } from "@/lib/types";

type Props = {
  patients: PatientProfile[];
  onChange: () => void;
};

export function CheckoutPatientsSection({ patients, onChange }: Props) {
  const multiPerson = patients.length > 1;

  return (
    <div className={checkoutSectionClassName}>
      <div className={checkoutHeaderClassName}>
        <span>{multiPerson ? `Osoby (${patients.length})` : patients[0]!.fullName}</span>
        <span className="check">✓</span>
      </div>
      <div className={checkoutBodyClassName}>
        {multiPerson
          ? patients.map((p) => (
              <p key={p.id} className={checkoutPatientLineClassName}>
                {p.fullName} · {formatPatientIdentitySaved(p)}
              </p>
            ))
          : `${patients[0]!.email} · ${formatPatientIdentitySaved(patients[0]!)}`}{" "}
        ·{" "}
        <button type="button" className={checkoutLinkClassName} onClick={onChange}>
          Zmień
        </button>
      </div>
    </div>
  );
}
