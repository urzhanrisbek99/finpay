"use client";

import { useState, useCallback } from "react";
import { cardTransferApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";

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
      // Клиентские проверки — только для мгновенного фидбэка; настоящую
      // валидацию (баланс, лимит) выполняет сервер в transfer_money.
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

      const { data, balance, error } = await cardTransferApi.send(
        amount,
        cardNumber,
        comment,
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

  return { state, error, send, reset };
}
