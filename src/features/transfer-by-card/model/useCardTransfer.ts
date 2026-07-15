"use client";

import { useState, useCallback } from "react";
import { cardTransferApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { TRANSACTION_LIMITS } from "#shared/config";
import { formatCurrency } from "#shared/lib";

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
      // валидацию (сумма, баланс, лимит, заморозка) выполняет сервер в
      // transfer_money.
      if (
        !Number.isFinite(amount) ||
        amount < TRANSACTION_LIMITS.MIN_TRANSFER
      ) {
        setError(
          `Minimum transfer amount is ${formatCurrency(TRANSACTION_LIMITS.MIN_TRANSFER)}`,
        );
        return;
      }
      if (amount > TRANSACTION_LIMITS.MAX_TRANSFER) {
        setError(
          `Maximum transfer amount is ${formatCurrency(TRANSACTION_LIMITS.MAX_TRANSFER)}`,
        );
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
