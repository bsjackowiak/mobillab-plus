import { describe, expect, it } from "vitest";
import { validatePatientContact, validatePatientIdentity } from "@/lib/patient-onboarding";

describe("validatePatientContact", () => {
  it("accepts valid email and consent", () => {
    expect(validatePatientContact("jan@example.com", true)).toBeNull();
  });

  it("rejects missing consent", () => {
    expect(validatePatientContact("jan@example.com", false)).toBeTruthy();
  });
});

describe("validatePatientIdentity", () => {
  it("accepts valid PESEL identity", () => {
    expect(
      validatePatientIdentity("Jan", "Kowalski", {
        identityMode: "pesel",
        pesel: "44051401359",
        ageCategory: "adult",
        relation: "self",
      }),
    ).toBeNull();
  });

  it("rejects invalid PESEL", () => {
    expect(
      validatePatientIdentity("Jan", "Kowalski", {
        identityMode: "pesel",
        pesel: "12345678901",
        ageCategory: "adult",
        relation: "self",
      }),
    ).toBeTruthy();
  });

  it("accepts birth date for child", () => {
    expect(
      validatePatientIdentity("Ala", "Nowak", {
        identityMode: "birthDate",
        birthDate: "2020-05-10",
        ageCategory: "child_4_12",
        relation: "child",
      }),
    ).toBeNull();
  });
});
