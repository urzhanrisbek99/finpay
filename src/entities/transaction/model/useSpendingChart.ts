"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import type { Transaction } from "./types";

export type ChartPeriod = "Week" | "Month" | "Year";

export type ChartPoint = { label: string; amount: number };

type Bucket = { label: string; from: Date; to: Date };

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

function buildBuckets(period: ChartPeriod): Bucket[] {
  const buckets: Bucket[] = [];
  const today = startOfDay(new Date());

  if (period === "Week") {
    // последние 7 дней по дням
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
    // последние 4 недели по неделям
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
    // последние 12 месяцев
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

const isSpending = (tx: Transaction) =>
  (tx.type === "expense" || tx.type === "transfer") && tx.status !== "failed";

// сумма расходов за календарный месяц смещённый на offset (0 = текущий)
function monthlySpending(transactions: Transaction[], offset: number): number {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);

  return transactions.reduce((sum, tx) => {
    if (!isSpending(tx)) return sum;
    const created = new Date(tx.created_at);
    return created >= from && created < to ? sum + tx.amount : sum;
  }, 0);
}

export function useSpendingChart(period: ChartPeriod) {
  const transactions = useTransactionStore((state) => state.transactions);

  return useMemo(() => {
    const buckets = buildBuckets(period);

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

    const thisMonth = monthlySpending(transactions, 0);
    const lastMonth = monthlySpending(transactions, -1);
    const changePct =
      lastMonth === 0
        ? thisMonth > 0
          ? 100
          : 0
        : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

    return { data, thisMonth, changePct };
  }, [transactions, period]);
}
