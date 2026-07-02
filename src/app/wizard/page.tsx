"use client";

import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  btnSecondaryMtClassName,
} from "@/components/ui/app-button-layout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { OfferCard } from "@/components/ui/OfferCard";
import { checkoutWizardBackLinkClassName } from "@/components/ui/checkout-layout";
import { contentBoxClassName } from "@/components/ui/content-box-layout";
import { heroSubTightClassName } from "@/components/ui/page-hero-layout";
import { searchToastClassName } from "@/components/ui/search-box-layout";
import { formatAddFeedback } from "@/lib/add-to-cart";
import { useAddToCart } from "@/lib/use-add-to-cart";
import { buildWizardRecommendation, WIZARD_NO_REFERRAL_NOTE, WIZARD_STEPS } from "@/lib/wizard";
import { packageOfferHref } from "@/lib/product-href";
import type { WizardAnswers } from "@/lib/types";
import { wizardStickyFooterStackClassName } from "@/components/ui/wizard-page-layout";
import styles from "@/components/ui/WizardPage.module.css";

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const [phase, setPhase] = useState<"questions" | "result">("questions");
  const [toast, setToast] = useState("");

  const { requestAdd } = useAddToCart({
    onResult: (result) => {
      if (result.status === "added") {
        router.push("/koszyk");
        return;
      }
      const message = formatAddFeedback(result);
      if (message) {
        setToast(message);
        window.setTimeout(() => setToast(""), 1800);
      }
    },
  });

  const current = WIZARD_STEPS[step];
  const recommendation = phase === "result" ? buildWizardRecommendation(answers) : null;

  function select(value: string) {
    const key = current.id as keyof WizardAnswers;
    const next = { ...answers, [key]: value };
    setAnswers(next);

    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setPhase("result");
  }

  function goToPreviousQuestion() {
    if (phase === "result") {
      setPhase("questions");
      setStep(WIZARD_STEPS.length - 1);
      return;
    }
    if (step > 0) {
      setStep(step - 1);
    }
  }

  function handleAddToCart() {
    if (!recommendation) return;
    requestAdd({ kind: "package", packageId: recommendation.packageId });
  }

  const selected = answers[current.id as keyof WizardAnswers];

  if (phase === "result" && recommendation) {
    const href = packageOfferHref(recommendation.packageId);

    return (
      <MobileShell
        showBack
        backFallback="/"
        stickyFooter={
          <div className={wizardStickyFooterStackClassName}>
            <button type="button" className={btnPrimaryClassName} onClick={handleAddToCart}>
              Dodaj do koszyka — {recommendation.price} zł
            </button>
            <button type="button" className={btnSecondaryClassName} onClick={() => router.push(href)}>
              Zobacz szczegóły pakietu
            </button>
          </div>
        }
      >
        <div
          className={styles.progressDots}
          role="progressbar"
          aria-valuenow={WIZARD_STEPS.length}
          aria-valuemin={1}
          aria-valuemax={WIZARD_STEPS.length}
        >
          {Array.from({ length: WIZARD_STEPS.length }, (_, i) => (
            <span key={i} className={`${styles.dot} ${styles.dotActive}`} />
          ))}
        </div>

        <button type="button" className={checkoutWizardBackLinkClassName} onClick={goToPreviousQuestion}>
          ← Poprzednie pytanie
        </button>

        <p className={heroSubTightClassName}>Twoja rekomendacja</p>
        <h2 className={styles.question}>Polecamy ten pakiet</h2>
        <p className={styles.resultHeadline}>{recommendation.headline}</p>

        {toast && <p className={searchToastClassName}>{toast}</p>}

        <div className={styles.resultCard}>
          <OfferCard
            href={href}
            name={recommendation.name}
            typ="pakiet"
            price={recommendation.price}
            resultTime={recommendation.resultTime}
            testCount={recommendation.testCount}
            packageId={recommendation.packageId}
            onCartToast={(message) => {
              setToast(message);
              window.setTimeout(() => setToast(""), 1800);
            }}
          />
        </div>

        <div className={`${contentBoxClassName} ${styles.resultWhy}`}>
          <h3>Dlaczego ten pakiet?</h3>
          <p>{recommendation.why}</p>
        </div>

        <button type="button" className={btnSecondaryMtClassName} onClick={() => router.push("/")}>
          Wróć do wyszukiwania
        </button>
      </MobileShell>
    );
  }

  return (
    <MobileShell showBack backFallback="/" noCta>
      <div
        className={styles.progressDots}
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={WIZARD_STEPS.length}
      >
        {Array.from({ length: WIZARD_STEPS.length }, (_, i) => (
          <span key={i} className={`${styles.dot}${i <= step ? ` ${styles.dotActive}` : ""}`} />
        ))}
      </div>

      {step > 0 && (
        <button type="button" className={checkoutWizardBackLinkClassName} onClick={goToPreviousQuestion}>
          ← Poprzednie pytanie
        </button>
      )}

      <p className={heroSubTightClassName}>
        Pytanie {step + 1} z {WIZARD_STEPS.length}
      </p>
      <h2 className={styles.question}>{current.question}</h2>

      {"showNoReferralNote" in current && current.showNoReferralNote && (
        <p className={styles.note}>{WIZARD_NO_REFERRAL_NOTE}</p>
      )}

      <div className={styles.options} role="listbox" aria-label={current.question}>
        {current.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={selected === opt.value}
            onClick={() => select(opt.value)}
            className={`${styles.option}${selected === opt.value ? ` ${styles.optionSelected}` : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </MobileShell>
  );
}
