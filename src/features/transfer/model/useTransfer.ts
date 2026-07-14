"use client";

import { useState, useCallback } from "react";
import { transferApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { recipientApi, recipientModel } from "#entities/recipient";

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
