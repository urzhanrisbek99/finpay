"use client";

import { useState, useCallback } from "react";
import { transferApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { recipientApi, recipientModel } from "#entities/recipient";
import { TRANSACTION_LIMITS } from "#shared/config";
import {
  getMoneyErrorMessage,
  minAmountMessage,
  maxAmountMessage,
  MONEY_ERROR_UNKNOWN,
} from "#shared/lib";
import { useT } from "#shared/i18n";

type TransferState = "idle" | "loading" | "success" | "failed";

export function useTransfer() {
  const [state, setState] = useState<TransferState>("idle");
  const [error, setError] = useState<string | null>(null);
  const t = useT();

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

      const { data, balance, errorCode } = await transferApi.send(
        amount,
        phone,
        comment,
      );

      if (errorCode || !data || balance === null) {
        setState("failed");
        setError(getMoneyErrorMessage(t, errorCode ?? MONEY_ERROR_UNKNOWN));
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
    [user, addTransaction, setBalance, upsertRecipient, t],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, send, reset };
}
