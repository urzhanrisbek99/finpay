"use client";

import { useState, useCallback } from "react";
import { transferApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { recipientApi, recipientModel } from "#entities/recipient";
import { TRANSACTION_LIMITS } from "#shared/config";
import { formatCurrency } from "#shared/lib";

type TransferState = "idle" | "loading" | "success" | "failed";

export function useTransfer() {
  const [state, setState] = useState<TransferState>("idle");
  const [error, setError] = useState<string | null>(null);

  const user = userModel.useUserStore((s) => s.user);
  const setBalance = userModel.useUserStore((s) => s.setBalance);
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );
  const upsertRecipient = recipientModel.useRecipientStore(
    (s) => s.upsertRecipient,
  );

  const send = useCallback(
    async (
      amount: number,
      phone: string,
      comment?: string,
      saveName?: string,
    ) => {
      if (!user) return;
      // Клиентские проверки — только для мгновенного фидбэка; настоящую
      // валидацию (сумма, баланс, лимит, заморозка) выполняет сервер в
      // transfer_money. Границы берём из общего конфига, а не литералом:
      // те же числа зашиты в саму RPC.
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

      const { data, balance, error } = await transferApi.send(
        amount,
        phone,
        comment,
      );

      if (error || !data || balance === null) {
        setState("failed");
        setError(error);
        return;
      }

      addTransaction(data);
      setBalance(balance);

      const name = saveName?.trim();
      if (name) {
        // phone приходит как "+7XXXXXXXXXX" — храним 10 цифр, как в форме
        const digits = phone.replace(/\D/g, "").slice(-10);
        const { data: recipient } = await recipientApi.save(
          user.id,
          name,
          digits,
        );
        if (recipient) upsertRecipient(recipient);
      }

      setState("success");
    },
    [user, addTransaction, setBalance, upsertRecipient],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, send, reset };
}
