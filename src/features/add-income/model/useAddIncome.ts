"use client";

import { useState, useCallback } from "react";
import { addIncomeApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import type { TransactionCategory } from "#shared/model";
import { TRANSACTION_LIMITS } from "#shared/config";
import {
  getMoneyErrorMessage,
  minAmountMessage,
  maxAmountMessage,
  MONEY_ERROR_UNKNOWN,
} from "#shared/lib";
import { useT } from "#shared/i18n";

type AddIncomeState = "idle" | "loading" | "success" | "failed";

export function useAddIncome() {
  const [state, setState] = useState<AddIncomeState>("idle");
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  const user = userModel.useUserStore((s) => s.user);
  const setBalance = userModel.useUserStore((s) => s.setBalance);
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );

  const add = useCallback(
    async (amount: number, source: string, category: TransactionCategory) => {
      if (!user) return;
      if (
        !Number.isFinite(amount) ||
        amount < TRANSACTION_LIMITS.MIN_TRANSFER
      ) {
        setError(minAmountMessage(t));
        return;
      }
      // add_income тоже упирается в потолок — без этой проверки форма молча
      // отправляла бы заведомо отклоняемую сумму.
      if (amount > TRANSACTION_LIMITS.MAX_TRANSFER) {
        setError(maxAmountMessage(t));
        return;
      }

      setState("loading");
      setError(null);

      const { data, balance, errorCode } = await addIncomeApi.add(
        amount,
        source.trim() || "Income",
        category,
      );

      if (errorCode || !data || balance === null) {
        setState("failed");
        setError(getMoneyErrorMessage(t, errorCode ?? MONEY_ERROR_UNKNOWN));
        return;
      }

      addTransaction(data);
      setBalance(balance);
      setState("success");
    },
    [user, addTransaction, setBalance, t],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, add, reset };
}
