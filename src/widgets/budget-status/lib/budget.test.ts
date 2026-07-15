import { describe, expect, it } from "vitest";
import { computeBudget } from "./budget";

// 15 июля — ровно середина 31-дневного месяца, поэтому темп ≈ 48%.
const midJuly = new Date("2026-07-15T12:00:00");
// 2 февраля 2026 — 28 дней в месяце: ловит захардкоженные 30/31.
const earlyFeb = new Date("2026-02-02T12:00:00");

describe("computeBudget", () => {
  it("reports no-budget when no limit is set", () => {
    const b = computeBudget(50_000, 0, midJuly);
    expect(b.level).toBe("no-budget");
    expect(b.usedPercent).toBe(0);
  });

  it("stays on-track when the pace lands under the limit", () => {
    // 100k за 15 дней → прогноз ~207k при лимите 300k.
    expect(computeBudget(100_000, 300_000, midJuly).level).toBe("on-track");
  });

  it("warns trending-over while still under the limit", () => {
    // 100k за 15 дней → прогноз ~207k: лимит 150k ещё не превышен, но будет.
    const b = computeBudget(100_000, 150_000, midJuly);
    expect(b.level).toBe("trending-over");
    expect(b.projected).toBeGreaterThan(150_000);
  });

  it("reports over-budget once spending passes the limit", () => {
    expect(computeBudget(200_000, 150_000, midJuly).level).toBe("over-budget");
  });

  // over-budget важнее trending-over: перерасход уже случился.
  it("prefers over-budget over trending-over", () => {
    expect(computeBudget(400_000, 150_000, midJuly).level).toBe("over-budget");
  });

  it("projects from the share of the month elapsed", () => {
    // 15/31 месяца прошло → 100k / (15/31) ≈ 206_667.
    expect(computeBudget(100_000, 300_000, midJuly).projected).toBe(206_667);
  });

  it("uses the real length of a short month", () => {
    // 2/28 прошло → 10k / (2/28) = 140k, а не 150k (при 30 днях).
    expect(computeBudget(10_000, 500_000, earlyFeb).projected).toBe(140_000);
  });

  it("averages by the day of the month", () => {
    expect(computeBudget(30_000, 100_000, midJuly).dailyAvg).toBe(2_000);
  });

  it("caps usedPercent at 100 so the bar cannot overflow", () => {
    expect(computeBudget(900_000, 100_000, midJuly).usedPercent).toBe(100);
  });

  it("handles a clean slate on day one", () => {
    const b = computeBudget(0, 100_000, new Date("2026-07-01T09:00:00"));
    expect(b.level).toBe("on-track");
    expect(b.projected).toBe(0);
    expect(b.dailyAvg).toBe(0);
    expect(b.usedPercent).toBe(0);
  });

  it("marks the pace at the end of the bar on the last day", () => {
    expect(
      computeBudget(10_000, 100_000, new Date("2026-07-31T23:00:00"))
        .pacePercent,
    ).toBe(100);
  });
});
