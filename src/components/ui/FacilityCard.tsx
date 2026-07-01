import { LabInteriorIllustration } from "@/components/illustrations/LabInteriorIllustration";
import type { Facility } from "@/lib/locations";

type Props = {
  facility: Facility;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export function FacilityCard({ facility, compact = false, selected = false, onClick }: Props) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group w-full overflow-hidden rounded-[var(--radius-sm)] text-left transition-all ${
        selected
          ? "ring-2 ring-accent/50 shadow-[0_0_0_1px_var(--accent)]"
          : onClick
            ? "glass-interactive"
            : ""
      } ${compact ? "glass-elevated" : "glass-elevated"}`}
    >
      <div className="relative h-[88px] overflow-hidden">
        <LabInteriorIllustration theme={facility.theme} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
          <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted backdrop-blur-sm">
            {facility.distance}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {facility.rating}
          </span>
        </div>
      </div>

      <div className={compact ? "p-3" : "p-4"}>
        <strong className="block text-[14px] font-semibold tracking-[-0.01em]">{facility.name}</strong>
        <span className="mt-0.5 block text-[12px] leading-snug text-muted">
          {facility.address}, {facility.city}
        </span>
        {!compact && (
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Otwarte do {facility.openUntil}
          </span>
        )}
      </div>
    </Wrapper>
  );
}
