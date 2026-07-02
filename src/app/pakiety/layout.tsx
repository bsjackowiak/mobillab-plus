import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pakiety badań",
  description:
    "Gotowe pakiety badań laboratoryjnych — profilaktyka, tarczyca, metabolizm i więcej. Zamów bez skierowania.",
  path: "/pakiety",
});

export default function PakietyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
