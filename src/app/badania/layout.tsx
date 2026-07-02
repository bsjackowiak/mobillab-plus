import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Badania laboratoryjne",
  description:
    "Przeglądaj i zamawiaj badania laboratoryjne prywatnie online — morfologia, hormony, pakety i więcej.",
  path: "/badania",
});

export default function BadaniaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
