"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import { computeMonthlySpent } from "./stats";

// Выводим из уже гидрированных транзакций — отдельный запрос в БД больше не нужен.
export function useMonthlySpent() {
  const transactions = useTransactionStore((s) => s.transactions);
  const spent = useMemo(
    () => computeMonthlySpent(transactions, new Date()),
    [transactions],
  );
  return { spent };
}
