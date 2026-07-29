"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import { computeMonthlySpent } from "./stats";

export function useMonthlySpent() {
  const transactions = useTransactionStore((s) => s.transactions);
  const spent = useMemo(
    () => computeMonthlySpent(transactions, new Date()),
    [transactions],
  );
  return { spent };
}
