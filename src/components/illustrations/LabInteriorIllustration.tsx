import type { Facility } from "@/lib/locations";

const THEMES: Record<Facility["theme"], { a: string; b: string; c: string }> = {
  blue: { a: "#2563eb", b: "#3b82f6", c: "#60a5fa" },
  violet: { a: "#7c3aed", b: "#8b5cf6", c: "#a78bfa" },
  emerald: { a: "#059669", b: "#10b981", c: "#34d399" },
};

export function LabInteriorIllustration({
  theme = "blue",
  className = "",
}: {
  theme?: Facility["theme"];
  className?: string;
}) {
  const t = THEMES[theme];

  return (
    <svg viewBox="0 0 280 120" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`lab-sky-${theme}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.a} stopOpacity="0.35" />
          <stop offset="100%" stopColor={t.b} stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`lab-floor-${theme}`} x1="0" y1="0" x2="280" y2="0">
          <stop stopColor={t.c} stopOpacity="0.15" />
          <stop offset="1" stopColor={t.a} stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <rect width="280" height="120" fill={`url(#lab-sky-${theme})`} />
      <rect y="88" width="280" height="32" fill={`url(#lab-floor-${theme})`} />

      <rect x="16" y="36" width="88" height="52" rx="6" fill="white" fillOpacity="0.92" />
      <rect x="24" y="44" width="36" height="28" rx="3" fill={t.a} fillOpacity="0.12" />
      <rect x="66" y="48" width="30" height="4" rx="2" fill={t.a} fillOpacity="0.35" />
      <rect x="66" y="58" width="22" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="66" y="66" width="26" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" />

      <rect x="118" y="28" width="64" height="60" rx="8" fill="white" fillOpacity="0.95" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="150" cy="48" r="14" fill={t.b} fillOpacity="0.2" />
      <path d="M150 40v12M144 46h12" stroke={t.a} strokeWidth="2" strokeLinecap="round" />
      <rect x="130" y="68" width="40" height="4" rx="2" fill={t.a} fillOpacity="0.3" />
      <rect x="130" y="76" width="28" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />

      <rect x="196" y="42" width="68" height="46" rx="6" fill="white" fillOpacity="0.88" />
      <rect x="204" y="50" width="20" height="30" rx="3" fill={t.c} fillOpacity="0.35" />
      <rect x="230" y="54" width="26" height="4" rx="2" fill={t.a} fillOpacity="0.4" />
      <rect x="230" y="64" width="20" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
      <rect x="230" y="72" width="24" height="3" rx="1.5" fill="currentColor" fillOpacity="0.08" />

      <ellipse cx="140" cy="104" rx="100" ry="6" fill="black" fillOpacity="0.06" />
    </svg>
  );
}
