"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { recommendPackage, WIZARD_NO_REFERRAL_NOTE, WIZARD_STEPS } from "@/lib/wizard";
import type { WizardAnswers } from "@/lib/types";

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const current = WIZARD_STEPS[step];

  function select(value: string) {
    const key = current.id as keyof WizardAnswers;
    const next = { ...answers, [key]: value };
    setAnswers(next);

    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    router.push(`/produkt/${recommendPackage(next)}?from=wizard`);
  }

  const selected = answers[current.id as keyof WizardAnswers];

  return (
    <MobileShell showBack backFallback="/" noCta>
      <div className="progress-dots" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={WIZARD_STEPS.length}>
        {Array.from({ length: WIZARD_STEPS.length }, (_, i) => (
          <span key={i} className={i <= step ? "on" : ""} />
        ))}
      </div>

      <p className="hero-sub-tight">
        Pytanie {step + 1} z {WIZARD_STEPS.length}
      </p>
      <h2 className="question">{current.question}</h2>

      {"showNoReferralNote" in current && current.showNoReferralNote && (
        <p className="wizard-note">{WIZARD_NO_REFERRAL_NOTE}</p>
      )}

      <div className="options" role="listbox" aria-label={current.question}>
        {current.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={selected === opt.value}
            onClick={() => select(opt.value)}
            className={`option${selected === opt.value ? " selected" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </MobileShell>
  );
}
