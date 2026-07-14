import type { Transaction } from "./types";

export type DashboardStat = {
  label: string;
  amount: number;
  trend: string;
  positive: boolean | null;
};

export type ChartPeriod = "Week" | "Month" | "Year";

export type ChartPoint = { label: string; amount: number };

type Bucket = { label: string; from: Date; to: Date };

export const isIncome = (tx: Transaction) => tx.type === "income";

export const isExpense = (tx: Transaction) =>
  tx.type === "expense" || tx.type === "transfer";

export const isSpending = (tx: Transaction) =>
  isExpense(tx) && tx.status !== "failed";

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function sumBetween(
  transactions: Transaction[],
  from: Date,
  to: Date,
  predicate: (tx: Transaction) => boolean,
): number {
  return transactions.reduce((sum, tx) => {
    if (tx.status === "failed") return sum;
    const created = new Date(tx.created_at);
    if (created < from || created >= to) return sum;
    return predicate(tx) ? sum + tx.amount : sum;
  }, 0);
}

export function formatTrend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? "+" : "−"}${Math.abs(change)}%`;
}

export function computeDashboardStats(
  transactions: Transaction[],
  now: Date,
): DashboardStat[] {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const income = sumBetween(transactions, monthStart, now, isIncome);
  const prevIncome = sumBetween(
    transactions,
    prevMonthStart,
    monthStart,
    isIncome,
  );

  const expenses = sumBetween(transactions, monthStart, now, isExpense);
  const prevExpenses = sumBetween(
    transactions,
    prevMonthStart,
    monthStart,
    isExpense,
  );

  const pending = transactions.filter((tx) => tx.status === "pending");
  const pendingAmount = pending.reduce((sum, tx) => sum + tx.amount, 0);

  return [
    {
      label: "Monthly income",
      amount: income,
      trend: formatTrend(income, prevIncome),
      positive: income >= prevIncome,
    },
    {
      label: "Monthly expenses",
      amount: expenses,
      trend: formatTrend(expenses, prevExpenses),
      positive: expenses <= prevExpenses,
    },
    {
      label: "Pending",
      amount: pendingAmount,
      trend: `${pending.length} txn${pending.length === 1 ? "" : "s"}`,
      positive: null,
    },
  ];
}

export function buildBuckets(period: ChartPeriod, now: Date): Bucket[] {
  const buckets: Bucket[] = [];
  const today = startOfDay(now);

  if (period === "Week") {
    for (let i = 6; i >= 0; i--) {
      const from = new Date(today);
      from.setDate(today.getDate() - i);
      const to = new Date(from);
      to.setDate(from.getDate() + 1);
      buckets.push({
        label: from.toLocaleDateString("en-US", { weekday: "short" }),
        from,
        to,
      });
    }
  } else if (period === "Month") {
    for (let i = 3; i >= 0; i--) {
      const from = new Date(today);
      from.setDate(today.getDate() - (i + 1) * 7 + 1);
      const to = new Date(from);
      to.setDate(from.getDate() + 7);
      buckets.push({
        label: from.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        from,
        to,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const from = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      buckets.push({
        label: from.toLocaleDateString("en-US", { month: "short" }),
        from,
        to,
      });
    }
  }

  return buckets;
}

// Потрачено в текущем месяце (расходы + переводы, кроме failed).
// Совпадает с серверным current_month_spent.
export function computeMonthlySpent(
  transactions: Transaction[],
  now: Date,
): number {
  return monthlySpending(transactions, 0, now);
}

function monthlySpending(
  transactions: Transaction[],
  offset: number,
  now: Date,
): number {
  const from = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);

  return transactions.reduce((sum, tx) => {
    if (!isSpending(tx)) return sum;
    const created = new Date(tx.created_at);
    return created >= from && created < to ? sum + tx.amount : sum;
  }, 0);
}

export function computeSpendingChart(
  transactions: Transaction[],
  period: ChartPeriod,
  now: Date,
): { data: ChartPoint[]; thisMonth: number; changePct: number } {
  const buckets = buildBuckets(period, now);

  const data: ChartPoint[] = buckets.map((bucket) => {
    const amount = transactions.reduce((sum, tx) => {
      if (!isSpending(tx)) return sum;
      const created = new Date(tx.created_at);
      return created >= bucket.from && created < bucket.to
        ? sum + tx.amount
        : sum;
    }, 0);
    return { label: bucket.label, amount };
  });

  const thisMonth = monthlySpending(transactions, 0, now);
  const lastMonth = monthlySpending(transactions, -1, now);
  const changePct =
    lastMonth === 0
      ? thisMonth > 0
        ? 100
        : 0
      : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  return { data, thisMonth, changePct };
}

function netFlowThisMonth(transactions: Transaction[], now: Date): number {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return transactions.reduce((sum, tx) => {
    if (tx.status === "failed") return sum;
    const created = new Date(tx.created_at);
    if (created < monthStart) return sum;
    if (isIncome(tx)) return sum + tx.amount;
    if (isExpense(tx)) return sum - tx.amount;
    return sum;
  }, 0);
}

export function computeBalanceTrend(
  transactions: Transaction[],
  currentBalance: number,
  now: Date,
): number {
  const netFlow = netFlowThisMonth(transactions, now);
  const startBalance = currentBalance - netFlow;
  if (startBalance <= 0) return netFlow > 0 ? 100 : 0;
  return Math.round((netFlow / startBalance) * 1000) / 10;
}
