import { HomePageClient } from "./HomePageClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Badania laboratoryjne",
  description:
    "Zamów badania laboratoryjne prywatnie, bez skierowania — wyszukaj badanie, wybierz pakiet i umów pobranie online.",
  path: "/",
});

export default function HomePage() {
  return <HomePageClient />;
}
