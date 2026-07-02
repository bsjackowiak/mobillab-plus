import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Asystent doboru badań",
  description:
    "Nie wiesz, co wybrać? Odpowiedz na 3 pytania — Mobillab+ zaproponuje pakiet badań dopasowany do Twoich potrzeb.",
  path: "/wizard",
});

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
