"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import { computeBalanceTrend } from "./stats";

export function useBalanceTrend(currentBalance: number): number {
  const transactions = useTransactionStore((state) => state.transactions);
  return useMemo(
    () => computeBalanceTrend(transactions, currentBalance, new Date()),
    [transactions, currentBalance],
  );
}
