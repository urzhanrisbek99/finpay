"use client";

import { useState, useCallback } from "react";
import { cardTransferApi } from "../api";
import { userApi, userModel } from "#entities/user";
import { transactionModel, transactionApi } from "#entities/transaction";
import { cardApi } from "#entities/card";

type CardTransferState = "idle" | "loading" | "success" | "failed";

export function useCardTransfer() {
  const [state, setState] = useState<CardTransferState>("idle");
  const [error, setError] = useState<string | null>(null);

  const user = userModel.useUserStore((s) => s.user);
  const setBalance = userModel.useUserStore((s) => s.setBalance);
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );

  const send = useCallback(
    async (amount: number, cardNumber: string, comment?: string) => {
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

      const [{ data: card }, { data: spent }] = await Promise.all([
        cardApi.getCard(user.id),
        transactionApi.getMonthlySpent(user.id),
      ]);
      if (card && spent + amount > card.spending_limit) {
        setState("failed");
        setError("This transfer exceeds your monthly card limit");
        return;
      }

      const { data, error } = await cardTransferApi.send(
        user.id,
        amount,
        cardNumber,
        comment,
      );

      if (error || !data) {
        setState("failed");
        setError(error);
        return;
      }

      addTransaction(data);

      const newBalance = user.balance - amount;
      await userApi.updateBalance(user.id, newBalance);
      setBalance(newBalance);

      setState("success");
    },
    [user, addTransaction, setBalance],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, send, reset };
}
