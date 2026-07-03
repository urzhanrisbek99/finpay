"use client";

import { useState, useCallback } from "react";
import { transferApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel, transactionApi } from "#entities/transaction";
import { cardApi } from "#entities/card";

type TransferState = "idle" | "loading" | "success" | "failed";

export function useTransfer() {
  const [state, setState] = useState<TransferState>("idle");
  const [error, setError] = useState<string | null>(null);

  const user = userModel.useUserStore((s) => s.user);
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );

  const send = useCallback(
    async (amount: number, phone: string, comment?: string) => {
      if (!user) return;
      if (amount < 100) {
        setError("Minimum transfer amount is 100 ₸");
        return;
      }
      if (amount > user.balance) {
        setError("Insufficient balance");
        return;
      }

      setState("loading");
      setError(null);

      // проверяем месячный лимит карты
      const [{ data: card }, { data: spent }] = await Promise.all([
        cardApi.getCard(user.id),
        transactionApi.getMonthlySpent(user.id),
      ]);
      if (card && spent + amount > card.spending_limit) {
        setState("failed");
        setError("This transfer exceeds your monthly card limit");
        return;
      }

      const { data, error } = await transferApi.send(
        user.id,
        amount,
        phone,
        comment,
      );

      if (error || !data) {
        setState("failed");
        setError(error);
        return;
      }

      addTransaction(data);
      setState("success");
    },
    [user],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, send, reset };
}
