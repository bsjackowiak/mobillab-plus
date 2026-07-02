import { describe, expect, it } from "vitest";
import { shouldHydrateSession } from "@/lib/session-hydration-routes";

describe("shouldHydrateSession", () => {
  it("skips marketing and legal pages", () => {
    expect(shouldHydrateSession("/kontakt")).toBe(false);
    expect(shouldHydrateSession("/o-nas")).toBe(false);
    expect(shouldHydrateSession("/brand")).toBe(false);
    expect(shouldHydrateSession("/regulamin")).toBe(false);
    expect(shouldHydrateSession("/polityka-cookies")).toBe(false);
    expect(shouldHydrateSession("/polityka-prywatnosci")).toBe(false);
  });

  it("hydrates funnel and catalog routes", () => {
    expect(shouldHydrateSession("/")).toBe(true);
    expect(shouldHydrateSession("/koszyk")).toBe(true);
    expect(shouldHydrateSession("/checkout")).toBe(true);
    expect(shouldHydrateSession("/oferta/morfologia")).toBe(true);
  });
});
