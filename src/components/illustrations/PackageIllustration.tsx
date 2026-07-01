import type { ReactNode } from "react";

type Variant = "thyroid" | "cholesterol" | "control" | "vitamin-d" | "weight" | "default";

const VARIANTS: Record<Variant, ReactNode> = {
  thyroid: (
    <>
      <circle cx="100" cy="58" r="28" fill="var(--accent)" fillOpacity="0.12" />
      <path d="M100 38c-8 0-14 6-14 14v8c0 10 14 18 14 18s14-8 14-18v-8c0-8-6-14-14-14z" fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="2" />
      <ellipse cx="100" cy="56" rx="10" ry="6" fill="var(--accent-2)" fillOpacity="0.4" />
    </>
  ),
  cholesterol: (
    <>
      <path d="M100 78c-18-12-28-22-28-36 0-14 12-24 28-24s28 10 28 24c0 14-10 24-28 36z" fill="#ef4444" fillOpacity="0.18" stroke="#ef4444" strokeWidth="2" />
      <path d="M88 50 Q100 42 112 50" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  control: (
    <>
      <rect x="72" y="36" width="56" height="72" rx="8" fill="white" fillOpacity="0.9" stroke="var(--accent)" strokeWidth="2" />
      <rect x="82" y="50" width="36" height="4" rx="2" fill="var(--accent)" fillOpacity="0.5" />
      <rect x="82" y="62" width="28" height="3" rx="1.5" fill="var(--muted)" fillOpacity="0.3" />
      <rect x="82" y="72" width="32" height="3" rx="1.5" fill="var(--muted)" fillOpacity="0.2" />
      <path d="M82 88l8 8 16-16" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "vitamin-d": (
    <>
      <circle cx="100" cy="58" r="26" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1={100 + Math.cos((deg * Math.PI) / 180) * 34}
          y1={58 + Math.sin((deg * Math.PI) / 180) * 34}
          x2={100 + Math.cos((deg * Math.PI) / 180) * 42}
          y2={58 + Math.sin((deg * Math.PI) / 180) * 42}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
    </>
  ),
  weight: (
    <>
      <rect x="78" y="70" width="44" height="28" rx="6" fill="var(--accent-2)" fillOpacity="0.2" stroke="var(--accent-2)" strokeWidth="2" />
      <rect x="94" y="44" width="12" height="28" rx="3" fill="var(--accent-2)" fillOpacity="0.35" />
      <line x1="70" y1="84" x2="130" y2="84" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  default: (
    <>
      <rect x="82" y="40" width="36" height="56" rx="6" fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" strokeWidth="2" />
      <rect x="88" y="58" width="24" height="28" rx="3" fill="var(--accent-2)" fillOpacity="0.35" />
    </>
  ),
};

export function PackageIllustration({
  packageId,
  className = "",
}: {
  packageId: string;
  className?: string;
}) {
  const variant = (packageId in VARIANTS ? packageId : "default") as Variant;

  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="pkg-bg" x1="0" y1="0" x2="200" y2="120">
          <stop stopColor="var(--accent)" stopOpacity="0.1" />
          <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" rx="16" fill="url(#pkg-bg)" />
      {VARIANTS[variant]}
    </svg>
  );
}
