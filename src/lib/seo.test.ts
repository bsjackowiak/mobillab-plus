import { describe, expect, it } from "vitest";
import { catalogMetaDescription, truncateMetaDescription } from "@/lib/seo";

describe("truncateMetaDescription", () => {
  it("returns short text unchanged", () => {
    expect(truncateMetaDescription("Krótki opis badania.")).toBe("Krótki opis badania.");
  });

  it("truncates long text with ellipsis", () => {
    const long = "a".repeat(200);
    const result = truncateMetaDescription(long);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("catalogMetaDescription", () => {
  it("uses catalog description when long enough", () => {
    const result = catalogMetaDescription(
      "To jest **dłuższy** opis badania laboratoryjnego zawierający istotne informacje dla pacjenta.",
      "Morfologia",
    );
    expect(result).toContain("dłuższy");
    expect(result).not.toContain("**");
  });

  it("falls back to template for short descriptions", () => {
    const result = catalogMetaDescription("Krótki.", "TSH");
    expect(result).toContain("TSH");
    expect(result).toContain("Mobillab+");
  });
});
