const MARKETING_ONLY_PATHS = new Set([
  "/kontakt",
  "/o-nas",
  "/brand",
  "/regulamin",
  "/polityka-cookies",
  "/polityka-prywatnosci",
]);

export function shouldHydrateSession(pathname: string): boolean {
  if (MARKETING_ONLY_PATHS.has(pathname)) return false;
  return true;
}
