export type SiteNavItem = {
  label: string;
  href: string;
};

/** Główne linki w poziomym menu (desktop). */
export const TOP_NAV_ITEMS: SiteNavItem[] = [
  { label: "Strona główna", href: "/" },
  { label: "Badania", href: "/badania" },
  { label: "Pakiety", href: "/pakiety" },
  { label: "Kategorie", href: "/kategorie" },
  { label: "O nas", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
];

export const SITE_MENU_ITEMS: SiteNavItem[] = [
  { label: "Pakiety badań", href: "/pakiety" },
  { label: "Badania", href: "/badania" },
  { label: "Kategorie", href: "/kategorie" },
  { label: "O nas", href: "/o-nas" },
  { label: "Regulamin", href: "/regulamin" },
  { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
  { label: "Polityka cookies", href: "/polityka-cookies" },
  { label: "Kontakt", href: "/kontakt" },
];
