"use client";

import { useMemo } from "react";
import { useTimeZone } from "#shared/i18n";
import { useTransactionStore } from "./store";
import { computeBalanceTrend } from "./stats";

export function useBalanceTrend(currentBalance: number): number {
  const transactions = useTransactionStore((state) => state.transactions);
  const timeZone = useTimeZone();
  return useMemo(
    () =>
      computeBalanceTrend(transactions, currentBalance, new Date(), timeZone),
    [transactions, currentBalance, timeZone],
  );
}
