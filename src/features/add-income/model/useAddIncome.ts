"use client";

import { useState, useCallback } from "react";
import { addIncomeApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import type { TransactionCategory } from "#shared/model";

type AddIncomeState = "idle" | "loading" | "success" | "failed";

export function useAddIncome() {
  const [state, setState] = useState<AddIncomeState>("idle");
  const [error, setError] = useState<string | null>(null);

  const user = userModel.useUserStore((s) => s.user);
  const setBalance = userModel.useUserStore((s) => s.setBalance);
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );

  const add = useCallback(
    async (amount: number, source: string, category: TransactionCategory) => {
      if (!user) return;
      if (!Number.isFinite(amount) || amount < 100) {
        setError("Minimum income amount is 100 ₸");
        return;
      }

      setState("loading");
      setError(null);

      const { data, balance, error } = await addIncomeApi.add(
        amount,
        source.trim() || "Income",
        category,
      );

      if (error || !data || balance === null) {
        setState("failed");
        setError(error);
        return;
      }

      addTransaction(data);
      setBalance(balance);
      setState("success");
    },
    [user, addTransaction, setBalance],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, add, reset };
}
