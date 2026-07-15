"use client";

import { useState, useCallback } from "react";
import { cardTransferApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { TRANSACTION_LIMITS } from "#shared/config";
import {
  getMoneyErrorMessage,
  minAmountMessage,
  maxAmountMessage,
  MONEY_ERROR_UNKNOWN,
} from "#shared/lib";
import { useT } from "#shared/i18n";

type CardTransferState = "idle" | "loading" | "success" | "failed";

export function useCardTransfer() {
  const [state, setState] = useState<CardTransferState>("idle");
  const [error, setError] = useState<string | null>(null);
  const t = useT();

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
        setError(minAmountMessage(t));
        return;
      }
      if (amount > TRANSACTION_LIMITS.MAX_TRANSFER) {
        setError(maxAmountMessage(t));
        return;
      }
      if (amount > user.balance) {
        setError(t.money.errors.insufficientBalance);
        return;
      }

      setState("loading");
      setError(null);

      const { data, balance, errorCode } = await cardTransferApi.send(
        amount,
        cardNumber,
        comment,
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

  return { state, error, send, reset };
}
