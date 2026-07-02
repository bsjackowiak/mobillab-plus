import type { ReactNode } from "react";
import {
  catalogPageAsideExtraClassName,
  catalogPageClassName,
  catalogPageSearchClassName,
  catalogPageSubClassName,
  catalogPageTitleClassName,
} from "@/components/ui/catalog-page-layout";
import { heroSubClassName } from "@/components/ui/page-hero-layout";

type CatalogPageLayoutProps = {
  title: string;
  subtitle: string;
  search?: ReactNode;
  asideExtra?: ReactNode;
  children: ReactNode;
};

export function CatalogPageLayout({
  title,
  subtitle,
  search,
  asideExtra,
  children,
}: CatalogPageLayoutProps) {
  return (
    <div className={catalogPageClassName}>
      <h2 className={catalogPageTitleClassName}>{title}</h2>
      <p className={`${heroSubClassName} ${catalogPageSubClassName}`}>{subtitle}</p>
      {search ? <div className={catalogPageSearchClassName}>{search}</div> : null}
      {asideExtra ? <div className={catalogPageAsideExtraClassName}>{asideExtra}</div> : null}
      {children}
    </div>
  );
}
