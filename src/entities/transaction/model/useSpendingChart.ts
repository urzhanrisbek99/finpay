"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import { computeSpendingChart, type ChartPeriod } from "./stats";

export type { ChartPeriod, ChartPoint } from "./stats";

export function useSpendingChart(period: ChartPeriod) {
  const transactions = useTransactionStore((state) => state.transactions);
  return useMemo(
    () => computeSpendingChart(transactions, period, new Date()),
    [transactions, period],
  );
}
