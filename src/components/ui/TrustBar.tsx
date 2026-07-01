export function TrustBar() {
  const items = [
    {
      label: "60s checkout",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      label: "ISO 15189",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: "4.9 / 5",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="glass-elevated grid grid-cols-3 gap-1 rounded-[var(--radius-sm)] p-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1.5 py-1">
          {item.icon}
          <span className="text-[10px] font-semibold tracking-wide text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
