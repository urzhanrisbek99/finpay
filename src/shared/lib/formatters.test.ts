import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  getInitials,
  isValidPhone,
  formatCardInput,
  isValidCardNumber,
  formatPhone,
} from "./formatters";

const digitsOnly = (s: string) => s.replace(/\D/g, "");

describe("formatCurrency", () => {
  it("appends the tenge sign and keeps all digits", () => {
    const out = formatCurrency(1_240_500);
    expect(out.endsWith("₸")).toBe(true);
    expect(digitsOnly(out)).toBe("1240500");
  });

  it("drops fractional part", () => {
    expect(digitsOnly(formatCurrency(99.9))).toBe("100");
  });

  it("formats zero", () => {
    expect(digitsOnly(formatCurrency(0))).toBe("0");
  });
});

describe("getInitials", () => {
  it("takes first letters of the first two words, uppercased", () => {
    expect(getInitials("asel nurlan")).toBe("AN");
  });

  it("handles a single name", () => {
    expect(getInitials("Asel")).toBe("A");
  });

  it("collapses extra whitespace and ignores words beyond the second", () => {
    expect(getInitials("  asel   bekova  kyzy ")).toBe("AB");
  });

  it("returns an empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });
});

describe("isValidPhone", () => {
  it("accepts a 10-digit number starting with 7", () => {
    expect(isValidPhone("7021234567")).toBe(true);
  });

  it("rejects wrong prefix or length", () => {
    expect(isValidPhone("6021234567")).toBe(false);
    expect(isValidPhone("70212345")).toBe(false);
    expect(isValidPhone("70212345678")).toBe(false);
  });
});

describe("formatCardInput", () => {
  it("groups digits into blocks of four", () => {
    expect(formatCardInput("1234567812345678")).toBe("1234 5678 1234 5678");
  });

  it("strips non-digits and caps at 16 digits", () => {
    expect(formatCardInput("1234-5678-9012-3456-9999")).toBe(
      "1234 5678 9012 3456",
    );
  });

  it("returns an empty string when there are no digits", () => {
    expect(formatCardInput("abc")).toBe("");
  });
});

describe("isValidCardNumber", () => {
  it("accepts exactly 16 digits, with or without separators", () => {
    expect(isValidCardNumber("1234567812345678")).toBe(true);
    expect(isValidCardNumber("1234 5678 1234 5678")).toBe(true);
  });

  it("rejects the wrong number of digits", () => {
    expect(isValidCardNumber("123456781234567")).toBe(false);
  });
});

describe("formatPhone", () => {
  it("formats a full 10-digit local number", () => {
    expect(formatPhone("7021234567")).toBe("(702) 123-45-67");
  });

  it("formats partial input as the user types", () => {
    expect(formatPhone("702")).toBe("(702");
    expect(formatPhone("702123")).toBe("(702) 123");
    expect(formatPhone("70212345")).toBe("(702) 123-45");
  });
});
