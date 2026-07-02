import type { WizardAnswers } from "./types";
import { getPackageById } from "./packages";

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

export type WizardRecommendation = {
  packageId: string;
  name: string;
  price: number;
  testCount: number;
  resultTime: string;
  why: string;
  headline: string;
};

function wizardRecommendationHeadline(answers: Partial<WizardAnswers>, packageId: string): string {
  const concern = answers.concern;
  const purpose = answers.purpose;

  if (packageId === "weight") {
    return "Przy problemach z wagą warto sprawdzić metabolizm i hormony.";
  }
  if (packageId === "vitamin-d") {
    return "Krótkotrwałe zmęczenie często wiąże się z niedoborem witaminy D.";
  }
  if (packageId === "thyroid") {
    return concern === "pain"
      ? "Przy dyskomforcie i zmęczeniu dobrze zacząć od tarczycy."
      : "Zmęczenie to częsty sygnał do sprawdzenia tarczycy.";
  }
  if (packageId === "control") {
    if (concern === "child") return "Dla dziecka proponujemy bezpieczny pakiet kontrolny.";
    if (purpose === "doctor") return "Gdy lekarz zaleca badania, pakiet kontrolny obejmuje podstawy.";
    return "Do rutynowej kontroli i profilaktyki — szeroki, ale sensowny zestaw.";
  }
  return "Na podstawie odpowiedzi dobieramy pakiet dopasowany do Twoich potrzeb.";
}

export function buildWizardRecommendation(answers: Partial<WizardAnswers>): WizardRecommendation | null {
  const packageId = recommendPackage(answers);
  const pkg = getPackageById(packageId);
  if (!pkg) return null;

  return {
    packageId,
    name: pkg.name,
    price: pkg.price,
    testCount: pkg.testCount,
    resultTime: pkg.resultTime,
    why: pkg.why,
    headline: wizardRecommendationHeadline(answers, packageId),
  };
}
