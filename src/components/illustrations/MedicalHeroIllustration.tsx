export function MedicalHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="hero-mesh-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-blue)" stopOpacity="0.2" />
          <stop offset="45%" stopColor="var(--brand-orange)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--green)" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="hero-mesh-b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--brand-blue-soft)" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="hero-vial" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-blue)" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
        </linearGradient>
        <pattern id="hero-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--brand-blue)" fillOpacity="0.08" />
        </pattern>
      </defs>

      <rect width="560" height="360" fill="url(#hero-mesh-a)" />
      <rect width="560" height="360" fill="url(#hero-dots)" />
      <ellipse cx="480" cy="60" rx="120" ry="80" fill="var(--brand-blue)" fillOpacity="0.07" />
      <ellipse cx="80" cy="300" rx="100" ry="70" fill="var(--brand-orange)" fillOpacity="0.08" />

      <g opacity="0.55">
        <path
          d="M48 220 C120 180, 200 240, 280 200 S440 160, 512 200"
          stroke="var(--green)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="280" cy="200" r="5" fill="var(--green)" />
        <circle cx="400" cy="175" r="4" fill="var(--brand-blue)" fillOpacity="0.6" />
      </g>

      <g transform="translate(72 88)">
        <rect width="168" height="112" rx="20" fill="url(#hero-mesh-b)" stroke="var(--border)" strokeWidth="1" />
        <rect x="20" y="24" width="72" height="8" rx="4" fill="var(--brand-blue)" fillOpacity="0.35" />
        <rect x="20" y="42" width="128" height="6" rx="3" fill="var(--text-secondary)" fillOpacity="0.15" />
        <rect x="20" y="56" width="108" height="6" rx="3" fill="var(--text-secondary)" fillOpacity="0.1" />
        <rect x="20" y="78" width="128" height="18" rx="9" fill="var(--brand-blue-soft)" />
        <text x="34" y="91" fill="var(--accent)" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
          Wynik online
        </text>
      </g>

      <g transform="translate(228 64)">
        <rect x="0" y="16" width="56" height="88" rx="14" fill="white" fillOpacity="0.95" stroke="var(--border)" />
        <rect x="8" y="4" width="40" height="18" rx="8" fill="white" stroke="var(--border)" />
        <rect x="10" y="52" width="36" height="44" rx="8" fill="url(#hero-vial)" />
        <ellipse cx="28" cy="52" rx="18" ry="4" fill="white" fillOpacity="0.4" />
      </g>

      <g transform="translate(340 92)">
        <rect width="148" height="100" rx="20" fill="white" fillOpacity="0.92" stroke="var(--border)" />
        <circle cx="118" cy="36" r="18" fill="var(--success-soft)" />
        <path
          d="M111 36l5 5 10-11"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="20" y="28" width="64" height="8" rx="4" fill="var(--text)" fillOpacity="0.12" />
        <rect x="20" y="44" width="88" height="6" rx="3" fill="var(--text-secondary)" fillOpacity="0.12" />
        <rect x="20" y="68" width="108" height="14" rx="7" fill="var(--brand-orange-soft)" />
      </g>

      <g transform="translate(168 228)">
        <rect width="224" height="56" rx="16" fill="white" fillOpacity="0.88" stroke="var(--border)" />
        <circle cx="36" cy="28" r="14" fill="var(--brand-blue-soft)" />
        <path d="M30 28h12M36 22v12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        <rect x="64" y="18" width="100" height="8" rx="4" fill="var(--text)" fillOpacity="0.1" />
        <rect x="64" y="32" width="140" height="6" rx="3" fill="var(--text-secondary)" fillOpacity="0.12" />
      </g>
    </svg>
  );
}
