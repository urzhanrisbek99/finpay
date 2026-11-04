import { describe, expect, it } from "vitest";
import {
  daysInMonth,
  isValidTimeZone,
  sameZonedDay,
  zonedDate,
  zonedMidnight,
  zonedMonthStart,
} from "./zoned";

describe("zonedDate", () => {
  it("reads the calendar date in the given zone, not the runtime's", () => {
    const lateJulyUtc = new Date("2026-07-31T20:00:00Z");
    expect(zonedDate(lateJulyUtc, "UTC")).toEqual({
      year: 2026,
      month: 7,
      day: 31,
    });
    expect(zonedDate(lateJulyUtc, "Asia/Almaty")).toEqual({
      year: 2026,
      month: 8,
      day: 1,
    });
  });
});

describe("zonedMidnight", () => {
  it("returns the instant a day starts in that zone", () => {
    expect(zonedMidnight("Asia/Almaty", 2026, 8, 1).toISOString()).toBe(
      "2026-07-31T19:00:00.000Z",
    );
    expect(zonedMidnight("America/New_York", 2026, 1, 15).toISOString()).toBe(
      "2026-01-15T05:00:00.000Z",
    );
  });

  it("uses the offset in force on that day across a DST change", () => {
    expect(zonedMidnight("Europe/Berlin", 2026, 3, 29).toISOString()).toBe(
      "2026-03-28T23:00:00.000Z",
    );
    expect(zonedMidnight("Europe/Berlin", 2026, 3, 30).toISOString()).toBe(
      "2026-03-29T22:00:00.000Z",
    );
  });

  it("normalises overflowing days and months like Date does", () => {
    expect(zonedMidnight("UTC", 2026, 1, 0).toISOString()).toBe(
      "2025-12-31T00:00:00.000Z",
    );
    expect(zonedMonthStart("UTC", 2026, 0).toISOString()).toBe(
      "2025-12-01T00:00:00.000Z",
    );
  });
});

describe("sameZonedDay", () => {
  it("compares dates as the viewer sees them", () => {
    const a = new Date("2026-07-31T18:30:00Z");
    const b = new Date("2026-07-31T19:30:00Z");
    expect(sameZonedDay(a, b, "UTC")).toBe(true);
    expect(sameZonedDay(a, b, "Asia/Almaty")).toBe(false);
  });
});

describe("daysInMonth", () => {
  it("knows February in leap and common years", () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe("isValidTimeZone", () => {
  it("accepts IANA names and rejects anything a cookie could smuggle in", () => {
    expect(isValidTimeZone("Asia/Almaty")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
  });
});
