"use client";

import { useMemo } from "react";
import { useTimeZone } from "#shared/i18n";
import { useTransactionStore } from "./store";
import { computeMonthlySpent } from "./stats";

export function useMonthlySpent() {
  const transactions = useTransactionStore((s) => s.transactions);
  const timeZone = useTimeZone();
  const spent = useMemo(
    () => computeMonthlySpent(transactions, new Date(), timeZone),
    [transactions, timeZone],
  );
  return { spent };
}
