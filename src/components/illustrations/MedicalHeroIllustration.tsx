export function MedicalHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="var(--accent-2)" stopOpacity="0.1" />
          <stop offset="1" stopColor="var(--success)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="vial-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7" />
        </linearGradient>
        <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="320" height="180" rx="20" fill="url(#hero-bg)" />

      <circle cx="260" cy="40" r="48" fill="var(--accent)" fillOpacity="0.06" />
      <circle cx="48" cy="148" r="36" fill="var(--accent-2)" fillOpacity="0.08" />

      <path
        d="M40 110 Q80 95 120 108 T200 100 T280 92"
        stroke="var(--success)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.55"
        fill="none"
      />
      <circle cx="200" cy="100" r="4" fill="var(--success)" fillOpacity="0.8" />

      <g filter="url(#hero-glow)">
        <rect x="118" y="52" width="44" height="72" rx="8" fill="white" fillOpacity="0.92" stroke="var(--border-strong)" strokeWidth="1.2" />
        <rect x="124" y="44" width="32" height="14" rx="4" fill="white" fillOpacity="0.95" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="126" y="78" width="28" height="38" rx="4" fill="url(#vial-fill)" />
        <ellipse cx="140" cy="78" rx="14" ry="3" fill="white" fillOpacity="0.35" />
      </g>

      <g opacity="0.9">
        <rect x="196" y="64" width="72" height="52" rx="10" fill="white" fillOpacity="0.88" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="206" y="76" width="28" height="4" rx="2" fill="var(--accent)" fillOpacity="0.5" />
        <rect x="206" y="86" width="48" height="3" rx="1.5" fill="var(--muted)" fillOpacity="0.25" />
        <rect x="206" y="94" width="40" height="3" rx="1.5" fill="var(--muted)" fillOpacity="0.18" />
        <circle cx="252" cy="82" r="10" fill="var(--success-soft)" />
        <path d="M248 82l3 3 6-6" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g opacity="0.85">
        <circle cx="72" cy="72" r="22" fill="white" fillOpacity="0.85" stroke="var(--border-strong)" />
        <path d="M72 62v14M65 69h14" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
