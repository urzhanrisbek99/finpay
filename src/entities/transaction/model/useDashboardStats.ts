"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import type { Transaction } from "./types";

export type DashboardStat = {
  label: string;
  amount: number;
  trend: string;
  positive: boolean | null;
};

function getMonthRanges() {
  const now = new Date();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return { monthStart, prevMonthStart };
}

function sumBetween(
  transactions: Transaction[],
  from: Date,
  to: Date,
  predicate: (tx: Transaction) => boolean,
): number {
  return transactions.reduce((sum, tx) => {
    if (tx.status === "failed") return sum;
    const created = new Date(tx.created_at);
    if (created < from || created >= to) return sum;
    return predicate(tx) ? sum + tx.amount : sum;
  }, 0);
}

function formatTrend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? "+" : "−"}${Math.abs(change)}%`;
}

const isIncome = (tx: Transaction) => tx.type === "income";
const isExpense = (tx: Transaction) =>
  tx.type === "expense" || tx.type === "transfer";

export function useDashboardStats(): DashboardStat[] {
  const transactions = useTransactionStore((state) => state.transactions);

  return useMemo(() => {
    const { monthStart, prevMonthStart } = getMonthRanges();

    const income = sumBetween(transactions, monthStart, new Date(), isIncome);
    const prevIncome = sumBetween(
      transactions,
      prevMonthStart,
      monthStart,
      isIncome,
    );

    const expenses = sumBetween(
      transactions,
      monthStart,
      new Date(),
      isExpense,
    );
    const prevExpenses = sumBetween(
      transactions,
      prevMonthStart,
      monthStart,
      isExpense,
    );

    const pending = transactions.filter((tx) => tx.status === "pending");
    const pendingAmount = pending.reduce((sum, tx) => sum + tx.amount, 0);

    return [
      {
        label: "Monthly income",
        amount: income,
        trend: formatTrend(income, prevIncome),
        positive: income >= prevIncome,
      },
      {
        label: "Monthly expenses",
        amount: expenses,
        trend: formatTrend(expenses, prevExpenses),
        // для расходов рост — это плохо
        positive: expenses <= prevExpenses,
      },
      {
        label: "Pending",
        amount: pendingAmount,
        trend: `${pending.length} txn${pending.length === 1 ? "" : "s"}`,
        positive: null,
      },
    ];
  }, [transactions]);
}
