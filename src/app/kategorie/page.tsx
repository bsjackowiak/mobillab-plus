import { MobileShell } from "@/components/layout/MobileShell";
import { CatalogPageLayout } from "@/components/layout/CatalogPageLayout";
import { CategoriesBrowser } from "@/components/category/CategoriesBrowser";
import { parseCategorySegments } from "@/lib/catalog-categories";
import { getFlatCategoryList, loadCatalogItems } from "@/lib/catalog";

function countCataloguedTests(): number {
  return loadCatalogItems().filter((item) => parseCategorySegments(item.kategorie || "").length > 0)
    .length;
}

export default function KategoriePage() {
  const items = getFlatCategoryList();
  const cataloguedTests = countCataloguedTests();

  return (
    <MobileShell showBack backFallback="/" noCta>
      <CatalogPageLayout
        title="Kategorie"
        subtitle="Przeglądaj badania według kategorii — od A do Z"
      >
        <CategoriesBrowser items={items} cataloguedTests={cataloguedTests} />
      </CatalogPageLayout>
    </MobileShell>
  );
}
