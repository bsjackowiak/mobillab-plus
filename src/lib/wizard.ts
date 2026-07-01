import type { WizardAnswers } from "./types";

export const WIZARD_NO_REFERRAL_NOTE =
  "Dobra wiadomość — wszystkie badania w Mobillab+ wykonasz prywatnie, bez skierowania.";

export const WIZARD_STEPS = [
  {
    id: "concern",
    question: "Co Cię najbardziej niepokoi?",
    options: [
      { value: "fatigue", label: "Zmęczenie i brak energii" },
      { value: "weight", label: "Problemy z wagą" },
      { value: "pain", label: "Ból lub dyskomfort" },
      { value: "control", label: "Rutynowa kontrola" },
      { value: "child", label: "Badania dla dziecka" },
    ],
  },
  {
    id: "duration",
    question: "Od kiedy występuje ten problem?",
    options: [
      { value: "week", label: "Około tygodnia" },
      { value: "month", label: "Około miesiąca" },
      { value: "longer", label: "Dłużej niż miesiąc" },
      { value: "unknown", label: "Nie wiem / nie dotyczy" },
    ],
  },
  {
    id: "purpose",
    question: "Czy badania wykonujesz profilaktycznie, czy z powodu objawów?",
    showNoReferralNote: true,
    options: [
      { value: "symptoms", label: "Mam objawy" },
      { value: "preventive", label: "Chcę wykonać badania profilaktyczne" },
      { value: "doctor", label: "Lekarz zalecił wykonanie badań" },
      { value: "health-check", label: "Chcę sprawdzić swój stan zdrowia" },
    ],
  },
] as const;

export function recommendPackage(answers: Partial<WizardAnswers>): string {
  const concern = answers.concern ?? "fatigue";
  const purpose = answers.purpose ?? "symptoms";
  const duration = answers.duration;

  if (concern === "weight") return "weight";
  if (concern === "child") return "control";

  if (concern === "control" || purpose === "preventive" || purpose === "health-check") {
    return "control";
  }

  if (concern === "pain" || concern === "fatigue") {
    if (duration === "week" && concern === "fatigue") return "vitamin-d";
    return "thyroid";
  }

  if (purpose === "doctor") return "control";

  return "thyroid";
}
