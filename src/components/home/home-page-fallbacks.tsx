import { Skeleton } from "@/components/ui/Skeleton";
import {
  homeFindClassName,
  homeSectionLabelClassName,
  homeShortcutsClassName,
} from "@/components/ui/home-page-layout";

export function HomeSearchFallback() {
  return (
    <div className={homeFindClassName} aria-hidden="true">
      <Skeleton className="h-[52px] w-full rounded-2xl" />
      <Skeleton className="mt-3 h-11 w-full rounded-xl" />
    </div>
  );
}

export function HomeRecommendedFallback() {
  return (
    <section className="mt-8 space-y-3" aria-hidden="true">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </section>
  );
}

export function HomeShortcutsFallback() {
  return (
    <section className={homeShortcutsClassName} aria-hidden="true">
      <Skeleton className={`${homeSectionLabelClassName} h-4 w-28`} />
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </section>
  );
}
