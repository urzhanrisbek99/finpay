"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import { computeDashboardStats } from "./stats";

export type { DashboardStat } from "./stats";

export function useDashboardStats() {
  const transactions = useTransactionStore((state) => state.transactions);
  return useMemo(
    () => computeDashboardStats(transactions, new Date()),
    [transactions],
  );
}
