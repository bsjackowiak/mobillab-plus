export const CONTACT_TOPICS = [
  { value: "order", label: "Zamówienie badań" },
  { value: "results", label: "Pytanie o wyniki" },
  { value: "home_visit", label: "Pobranie w domu" },
  { value: "b2b", label: "Współpraca B2B" },
  { value: "other", label: "Inne" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export const CONTACT_FORM_LIMITS = {
  nameMax: 120,
  emailMax: 254,
  phoneMax: 24,
  messageMin: 10,
  messageMax: 2000,
} as const;

export const CONTACT_MIN_SUBMIT_MS = 2500;
export const CONTACT_MAX_FORM_AGE_MS = 60 * 60 * 1000;

export type ContactFormInput = {
  name: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
  consent: boolean;
  formOpenedAt: number;
  companyWebsite?: string;
};

export type ContactFormFieldErrors = Partial<
  Record<"name" | "email" | "phone" | "topic" | "message" | "consent" | "form", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidContactTopic(value: string): value is ContactTopic {
  return CONTACT_TOPICS.some((item) => item.value === value);
}

export function validateContactForm(input: ContactFormInput): ContactFormFieldErrors {
  const errors: ContactFormFieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() ?? "";
  const message = input.message.trim();

  if (name.length < 2) {
    errors.name = "Podaj imię i nazwisko (min. 2 znaki).";
  } else if (name.length > CONTACT_FORM_LIMITS.nameMax) {
    errors.name = "Imię i nazwisko jest za długie.";
  }

  if (!EMAIL_RE.test(email)) {
    errors.email = "Podaj poprawny adres e-mail.";
  } else if (email.length > CONTACT_FORM_LIMITS.emailMax) {
    errors.email = "Adres e-mail jest za długi.";
  }

  if (phone && phone.length > CONTACT_FORM_LIMITS.phoneMax) {
    errors.phone = "Numer telefonu jest za długi.";
  }

  if (!isValidContactTopic(input.topic)) {
    errors.topic = "Wybierz temat wiadomości.";
  }

  if (message.length < CONTACT_FORM_LIMITS.messageMin) {
    errors.message = `Wiadomość musi mieć co najmniej ${CONTACT_FORM_LIMITS.messageMin} znaków.`;
  } else if (message.length > CONTACT_FORM_LIMITS.messageMax) {
    errors.message = `Wiadomość może mieć maksymalnie ${CONTACT_FORM_LIMITS.messageMax} znaków.`;
  }

  if (!input.consent) {
    errors.consent = "Zaznacz zgodę na kontakt w sprawie zapytania.";
  }

  return errors;
}

export function contactTopicLabel(topic: ContactTopic): string {
  return CONTACT_TOPICS.find((item) => item.value === topic)?.label ?? topic;
}
