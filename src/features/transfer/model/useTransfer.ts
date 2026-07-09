"use client";

import { useState, useCallback } from "react";
import { transferApi } from "../api";
import { userApi, userModel } from "#entities/user";
import { transactionModel, transactionApi } from "#entities/transaction";
import { cardApi } from "#entities/card";
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

      // перевод уходит с баланса — держим profiles.balance в согласии
      const newBalance = user.balance - amount;
      await userApi.updateBalance(user.id, newBalance);
      setBalance(newBalance);

      // сохраняем получателя в «частые переводы», если задано имя
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
