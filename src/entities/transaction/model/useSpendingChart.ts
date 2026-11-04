"use client";

import { useMemo } from "react";
import { useLocale, useTimeZone } from "#shared/i18n";
import { useTransactionStore } from "./store";
import { computeSpendingChart, type ChartPeriod } from "./stats";

export type { ChartPeriod, ChartPoint } from "./stats";

export function useSpendingChart(period: ChartPeriod) {
  const transactions = useTransactionStore((state) => state.transactions);
  const locale = useLocale();
  const timeZone = useTimeZone();
  return useMemo(
    () =>
      computeSpendingChart(transactions, period, new Date(), timeZone, locale),
    [transactions, period, locale, timeZone],
  );
}
