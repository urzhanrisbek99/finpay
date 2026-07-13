"use client";

import { useMemo } from "react";
import { useTransactionStore } from "./store";
import type { Transaction } from "./types";

const isIncome = (tx: Transaction) => tx.type === "income";
const isExpense = (tx: Transaction) =>
  tx.type === "expense" || tx.type === "transfer";

function netFlowThisMonth(transactions: Transaction[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return transactions.reduce((sum, tx) => {
    if (tx.status === "failed") return sum;
    const created = new Date(tx.created_at);
    if (created < monthStart) return sum;
    if (isIncome(tx)) return sum + tx.amount;
    if (isExpense(tx)) return sum - tx.amount;
    return sum;
  }, 0);
}

export function useBalanceTrend(currentBalance: number): number {
  const transactions = useTransactionStore((state) => state.transactions);

  return useMemo(() => {
    const netFlow = netFlowThisMonth(transactions);
    const startBalance = currentBalance - netFlow;
    if (startBalance <= 0) return netFlow > 0 ? 100 : 0;
    return Math.round((netFlow / startBalance) * 1000) / 10;
  }, [transactions, currentBalance]);
}
