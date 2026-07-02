import { describe, expect, it } from "vitest";
import { validateContactForm } from "@/lib/contact-form";

describe("validateContactForm", () => {
  it("accepts valid payload", () => {
    const errors = validateContactForm({
      name: "Jan Kowalski",
      email: "jan@example.com",
      topic: "order",
      message: "Chciałbym zapytać o badania.",
      consent: true,
      formOpenedAt: Date.now(),
    });

    expect(errors).toEqual({});
  });

  it("requires consent", () => {
    const errors = validateContactForm({
      name: "Jan Kowalski",
      email: "jan@example.com",
      topic: "order",
      message: "Chciałbym zapytać o badania.",
      consent: false,
      formOpenedAt: Date.now(),
    });

    expect(errors.consent).toBeTruthy();
  });

  it("rejects short message", () => {
    const errors = validateContactForm({
      name: "Jan Kowalski",
      email: "jan@example.com",
      topic: "order",
      message: "krótko",
      consent: true,
      formOpenedAt: Date.now(),
    });

    expect(errors.message).toBeTruthy();
  });
});
