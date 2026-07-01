"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
      aria-label={resolved === "dark" ? "Jasny motyw" : "Ciemny motyw"}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all hover:bg-accent-soft hover:text-foreground"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {resolved === "dark" ? (
          <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" /></>
        ) : (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        )}
      </svg>
    </button>
  );
}
