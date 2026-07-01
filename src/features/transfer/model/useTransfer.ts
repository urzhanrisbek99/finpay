"use client";

import { useState, useCallback } from "react";
import { transferApi } from "../api";
import { userModel } from "@/src/entities/user";
import { transactionModel } from "@/src/entities/transaction";

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
