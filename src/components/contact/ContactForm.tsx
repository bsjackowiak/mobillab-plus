"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import {
  CONTACT_FORM_LIMITS,
  CONTACT_TOPICS,
  validateContactForm,
  type ContactFormFieldErrors,
  type ContactTopic,
} from "@/lib/contact-form";
import {
  contactCharCountClassName,
  contactConsentClassName,
  contactConsentErrorClassName,
  contactFormAlertClassName,
  contactFormClassName,
  contactFormDemoNoteClassName,
  contactFormGridClassName,
  contactFormHeadingClassName,
  contactFormLeadClassName,
  contactFormMessageMetaClassName,
  contactFormPrivacyNoteClassName,
  contactFormResetBtnClassName,
  contactFormSelectClassName,
  contactFormSubmitClassName,
  contactFormSuccessClassName,
  contactFormSuccessIconClassName,
  contactFormSuccessTextClassName,
  contactFormSuccessTitleClassName,
  contactFormTextareaClassName,
  contactHpClassName,
  contactOptionalClassName,
} from "@/components/contact/contact-form-layout";
import {
  fieldErrorTextClassName,
  fieldGroupClassName,
  fieldHintClassName,
  fieldInputClassName,
  fieldLabelClassName,
} from "@/components/ui/form-field-layout";

type SubmitState = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const formOpenedAt = useRef(Date.now());
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<ContactTopic>("order");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFormFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [demoNotice, setDemoNotice] = useState(false);

  const messageLength = message.length;
  const messageRemaining = CONTACT_FORM_LIMITS.messageMax - messageLength;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setDemoNotice(false);

    const payload = {
      name,
      email,
      phone: phone || undefined,
      topic,
      message,
      consent,
      formOpenedAt: formOpenedAt.current,
      companyWebsite: honeypot,
    };

    const clientErrors = validateContactForm(payload);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setSubmitState("loading");

    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: ContactFormFieldErrors;
        demo?: boolean;
      };

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setFormError(data.error ?? "Nie udało się wysłać wiadomości. Spróbuj ponownie.");
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
      setDemoNotice(Boolean(data.demo));
      setName("");
      setEmail("");
      setPhone("");
      setTopic("order");
      setMessage("");
      setConsent(false);
      formOpenedAt.current = Date.now();
    } catch {
      setFormError("Brak połączenia. Sprawdź internet i spróbuj ponownie.");
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className={contactFormSuccessClassName} role="status" aria-live="polite">
        <div className={contactFormSuccessIconClassName} aria-hidden>
          ✓
        </div>
        <h3 className={contactFormSuccessTitleClassName}>Wiadomość wysłana</h3>
        <p className={contactFormSuccessTextClassName}>
          Dziękujemy za kontakt. Odpowiemy na podany adres e-mail w ciągu jednego dnia roboczego.
        </p>
        {demoNotice ? (
          <p className={contactFormDemoNoteClassName}>
            Tryb deweloperski: e-mail nie został wysłany (brak konfiguracji Resend).
          </p>
        ) : null}
        <button
          type="button"
          className={contactFormResetBtnClassName}
          onClick={() => setSubmitState("idle")}
        >
          Wyślij kolejną wiadomość
        </button>
      </div>
    );
  }

  return (
    <form
      className={contactFormClassName}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${formId}-title`}
    >
      <h3 id={`${formId}-title`} className={contactFormHeadingClassName}>
        Napisz do nas
      </h3>
      <p className={contactFormLeadClassName}>
        Opisz krótko sprawę — oddzwonimy lub odpiszemy na e-mail w ciągu jednego dnia roboczego.
      </p>

      {formError ? (
        <div className={contactFormAlertClassName} role="alert">
          {formError}
        </div>
      ) : null}

      <div className={contactHpClassName} aria-hidden="true">
        <label htmlFor={`${formId}-hp`}>Strona firmowa</label>
        <input
          id={`${formId}-hp`}
          type="text"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className={contactFormGridClassName}>
        <div className={fieldGroupClassName}>
          <label className={fieldLabelClassName} htmlFor={`${formId}-name`}>
            Imię i nazwisko
          </label>
          <input
            id={`${formId}-name`}
            className={fieldInputClassName(Boolean(fieldErrors.name))}
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={CONTACT_FORM_LIMITS.nameMax}
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
          />
          {fieldErrors.name ? (
            <span id={`${formId}-name-error`} className={fieldErrorTextClassName}>
              {fieldErrors.name}
            </span>
          ) : null}
        </div>

        <div className={fieldGroupClassName}>
          <label className={fieldLabelClassName} htmlFor={`${formId}-email`}>
            E-mail
          </label>
          <input
            id={`${formId}-email`}
            className={fieldInputClassName(Boolean(fieldErrors.email))}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={CONTACT_FORM_LIMITS.emailMax}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
          />
          {fieldErrors.email ? (
            <span id={`${formId}-email-error`} className={fieldErrorTextClassName}>
              {fieldErrors.email}
            </span>
          ) : null}
        </div>
      </div>

      <div className={contactFormGridClassName}>
        <div className={fieldGroupClassName}>
          <label className={fieldLabelClassName} htmlFor={`${formId}-phone`}>
            Telefon <span className={contactOptionalClassName}>(opcjonalnie)</span>
          </label>
          <input
            id={`${formId}-phone`}
            className={fieldInputClassName(Boolean(fieldErrors.phone))}
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            maxLength={CONTACT_FORM_LIMITS.phoneMax}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? `${formId}-phone-error` : undefined}
          />
          {fieldErrors.phone ? (
            <span id={`${formId}-phone-error`} className={fieldErrorTextClassName}>
              {fieldErrors.phone}
            </span>
          ) : null}
        </div>

        <div className={fieldGroupClassName}>
          <label className={fieldLabelClassName} htmlFor={`${formId}-topic`}>
            Temat
          </label>
          <select
            id={`${formId}-topic`}
            className={`${fieldInputClassName(Boolean(fieldErrors.topic))} ${contactFormSelectClassName}`}
            name="topic"
            required
            value={topic}
            onChange={(event) => setTopic(event.target.value as ContactTopic)}
            aria-invalid={Boolean(fieldErrors.topic)}
            aria-describedby={fieldErrors.topic ? `${formId}-topic-error` : undefined}
          >
            {CONTACT_TOPICS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {fieldErrors.topic ? (
            <span id={`${formId}-topic-error`} className={fieldErrorTextClassName}>
              {fieldErrors.topic}
            </span>
          ) : null}
        </div>
      </div>

      <div className={fieldGroupClassName}>
        <label className={fieldLabelClassName} htmlFor={`${formId}-message`}>
          Wiadomość
        </label>
        <textarea
          id={`${formId}-message`}
          className={`${fieldInputClassName(Boolean(fieldErrors.message))} ${contactFormTextareaClassName}`}
          name="message"
          required
          rows={5}
          maxLength={CONTACT_FORM_LIMITS.messageMax}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={`${formId}-message-hint${fieldErrors.message ? ` ${formId}-message-error` : ""}`}
          placeholder="Np. chcę umówić pobranie w domu w Poznaniu w przyszłym tygodniu…"
        />
        <div className={contactFormMessageMetaClassName}>
          {fieldErrors.message ? (
            <span id={`${formId}-message-error`} className={fieldErrorTextClassName}>
              {fieldErrors.message}
            </span>
          ) : (
            <span id={`${formId}-message-hint`} className={fieldHintClassName}>
              Min. {CONTACT_FORM_LIMITS.messageMin} znaków
            </span>
          )}
          <span className={contactCharCountClassName} aria-live="polite">
            {messageRemaining}
          </span>
        </div>
      </div>

      <div className={`${contactConsentClassName}${fieldErrors.consent ? ` ${contactConsentErrorClassName}` : ""}`}>
        <label htmlFor={`${formId}-consent`}>
          <input
            id={`${formId}-consent`}
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={fieldErrors.consent ? `${formId}-consent-error` : undefined}
          />
          <span>
            Wyrażam zgodę na kontakt w sprawie tego zapytania (e-mail / telefon). Administratorem
            danych jest Mobillab+. Więcej w{" "}
            <Link href="/polityka-prywatnosci">polityce prywatności</Link>.
          </span>
        </label>
        {fieldErrors.consent ? (
          <span id={`${formId}-consent-error`} className={`${fieldErrorTextClassName} consent-error-text`}>
            {fieldErrors.consent}
          </span>
        ) : null}
      </div>

      <button type="submit" className={contactFormSubmitClassName} disabled={submitState === "loading"}>
        {submitState === "loading" ? "Wysyłanie…" : "Wyślij wiadomość"}
      </button>

      <p className={contactFormPrivacyNoteClassName}>
        Nie wysyłamy newslettera. Dane służą wyłącznie do obsługi Twojego zapytania.
      </p>
    </form>
  );
}
