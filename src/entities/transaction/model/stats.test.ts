import { describe, expect, it } from "vitest";
import type { Transaction } from "./types";
import {
  computeBalanceTrend,
  computeDashboardStats,
  computeSpendingChart,
  formatTrend,
  isSpending,
  sumBetween,
} from "./stats";

// Все даты — локальные (без Z), чтобы тесты не зависели от таймзоны раннера.
const NOW = new Date("2026-07-14T12:00:00");
const MINUS = "−"; // тот же знак, что использует formatTrend для минуса

const tx = (o: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(36).slice(2),
  user_id: "u1",
  type: "expense",
  amount: 0,
  merchant: "m",
  category: "other",
  status: "completed",
  comment: null,
  method: null,
  created_at: "2026-07-10T12:00:00",
  ...o,
});

describe("isSpending", () => {
  it("counts expenses and transfers that are not failed", () => {
    expect(isSpending(tx({ type: "expense" }))).toBe(true);
    expect(isSpending(tx({ type: "transfer" }))).toBe(true);
    expect(isSpending(tx({ type: "income" }))).toBe(false);
    expect(isSpending(tx({ type: "expense", status: "failed" }))).toBe(false);
  });
});

describe("formatTrend", () => {
  it("returns +100% when there is no previous baseline but current is positive", () => {
    expect(formatTrend(500, 0)).toBe("+100%");
  });

  it("returns 0% when both are zero", () => {
    expect(formatTrend(0, 0)).toBe("0%");
  });

  it("computes a positive percentage change", () => {
    expect(formatTrend(150, 100)).toBe("+50%");
  });

  it("uses a real minus sign for a drop", () => {
    expect(formatTrend(50, 100)).toBe(`${MINUS}50%`);
  });
});

describe("sumBetween", () => {
  const from = new Date("2026-07-01T00:00:00");
  const to = new Date("2026-08-01T00:00:00");

  it("sums matching transactions inside the range and skips failed ones", () => {
    const txs = [
      tx({ amount: 100, created_at: "2026-07-05T12:00:00" }),
      tx({ amount: 200, created_at: "2026-07-06T12:00:00" }),
      tx({ amount: 999, status: "failed", created_at: "2026-07-07T12:00:00" }),
      tx({ amount: 500, created_at: "2026-06-30T12:00:00" }), // вне диапазона
    ];
    expect(sumBetween(txs, from, to, () => true)).toBe(300);
  });
});

describe("computeDashboardStats", () => {
  const txs = [
    tx({ type: "income", amount: 1000, created_at: "2026-07-05T12:00:00" }),
    tx({ type: "income", amount: 500, created_at: "2026-06-05T12:00:00" }),
    tx({ type: "expense", amount: 200, created_at: "2026-07-06T12:00:00" }),
    tx({ type: "transfer", amount: 100, created_at: "2026-07-07T12:00:00" }),
    tx({ type: "expense", amount: 400, created_at: "2026-06-06T12:00:00" }),
    tx({
      type: "expense",
      amount: 9999,
      status: "failed",
      created_at: "2026-07-08T12:00:00",
    }),
    tx({
      type: "expense",
      amount: 50,
      status: "pending",
      created_at: "2026-07-09T12:00:00",
    }),
  ];

  const [income, expenses, pending] = computeDashboardStats(txs, NOW);

  it("sums monthly income and its trend vs previous month", () => {
    expect(income).toEqual({
      key: "income",
      amount: 1000,
      trend: "+100%",
      positive: true,
    });
  });

  it("sums expenses (incl. transfers + pending), excludes failed, inverts polarity", () => {
    // 200 + 100 + 50(pending) = 350; prev = 400 => (350-400)/400 = -12.5 -> -12%
    expect(expenses).toEqual({
      key: "expenses",
      amount: 350,
      trend: `${MINUS}12%`,
      positive: true, // меньше прошлого месяца — хорошо
    });
  });

  it("reports pending count and amount without a polarity", () => {
    expect(pending).toEqual({
      key: "pending",
      amount: 50,
      count: 1,
      positive: null,
    });
  });
});

describe("computeSpendingChart", () => {
  const txs = [
    tx({ amount: 300, created_at: "2026-07-14T10:00:00" }), // сегодня
    tx({ amount: 100, created_at: "2026-07-11T10:00:00" }), // 3 дня назад
    tx({ amount: 200, created_at: "2026-06-10T10:00:00" }), // прошлый месяц
    tx({ type: "income", amount: 5000, created_at: "2026-07-13T10:00:00" }),
  ];

  it("builds 7 daily buckets for the week, newest last", () => {
    const { data } = computeSpendingChart(txs, "Week", NOW);
    expect(data).toHaveLength(7);
    expect(data[6].amount).toBe(300); // сегодня
    expect(data[3].amount).toBe(100); // 3 дня назад
    expect(data[0].amount).toBe(0);
  });

  it("builds 12 monthly buckets for the year", () => {
    expect(computeSpendingChart(txs, "Year", NOW).data).toHaveLength(12);
  });

  it("computes month-over-month spending and change %", () => {
    const { thisMonth, changePct } = computeSpendingChart(txs, "Week", NOW);
    expect(thisMonth).toBe(400); // 300 + 100, доход исключён
    expect(changePct).toBe(100); // (400 - 200) / 200
  });
});

describe("computeBalanceTrend", () => {
  const txs = [
    tx({ type: "income", amount: 1000, created_at: "2026-07-05T12:00:00" }),
    tx({ type: "expense", amount: 300, created_at: "2026-07-06T12:00:00" }),
  ];

  it("expresses this-month net flow as a % of the starting balance", () => {
    // netFlow = 700; start = 1700 - 700 = 1000; 700/1000 = 70%
    expect(computeBalanceTrend(txs, 1700, NOW)).toBe(70);
  });

  it("caps at 100% when the derived starting balance is non-positive", () => {
    expect(computeBalanceTrend(txs, 500, NOW)).toBe(100);
  });
});
