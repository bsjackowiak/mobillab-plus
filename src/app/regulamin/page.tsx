import { SitePage } from "@/components/layout/SitePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Regulamin",
  description: "Regulamin korzystania z usługi Mobillab+ — zamówienia, płatności, pobrania i wyniki badań.",
  path: "/regulamin",
});

export default function RegulaminPage() {
  return (
    <SitePage title="Regulamin" subtitle="Warunki korzystania z usługi Mobillab+">
      <p>
        Regulamin określa zasady składania zamówień na badania laboratoryjne, płatności, realizacji
        pobrania oraz otrzymywania wyników przez platformę Mobillab+.
      </p>
      <p>
        Zamówienie badania oznacza akceptację aktualnej wersji regulaminu oraz cennika obowiązującego
        w dniu złożenia zamówienia.
      </p>
    </SitePage>
  );
}
