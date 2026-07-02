"use client";

import { sectionLabelCompactClassName } from "@/components/ui/section-label-layout";
import { FacilityCard } from "@/components/ui/FacilityCard";
import { FACILITIES } from "@/lib/locations";

export function FacilityStrip() {
  return (
    <div>
      <p className={sectionLabelCompactClassName}>Placówki w pobliżu</p>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
        {FACILITIES.map((facility) => (
          <div key={facility.id} className="w-[220px] shrink-0">
            <FacilityCard facility={facility} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
