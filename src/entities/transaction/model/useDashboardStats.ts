"use client";

import { useMemo } from "react";
import { useTimeZone } from "#shared/i18n";
import { useTransactionStore } from "./store";
import { computeDashboardStats } from "./stats";

export type { DashboardStat } from "./stats";

export function useDashboardStats() {
  const transactions = useTransactionStore((state) => state.transactions);
  const timeZone = useTimeZone();
  return useMemo(
    () => computeDashboardStats(transactions, new Date(), timeZone),
    [transactions, timeZone],
  );
}
