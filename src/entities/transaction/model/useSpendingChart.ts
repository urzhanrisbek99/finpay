"use client";

import { useMemo } from "react";
import { useLocale } from "#shared/i18n";
import { useTransactionStore } from "./store";
import { computeSpendingChart, type ChartPeriod } from "./stats";

export type { ChartPeriod, ChartPoint } from "./stats";

export function useSpendingChart(period: ChartPeriod) {
  const transactions = useTransactionStore((state) => state.transactions);
  const locale = useLocale();
  return useMemo(
    () => computeSpendingChart(transactions, period, new Date(), locale),
    [transactions, period, locale],
  );
}
