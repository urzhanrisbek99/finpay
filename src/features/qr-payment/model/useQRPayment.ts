"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { qrPaymentApi } from "../api";
import { userModel } from "#entities/user";
import { transactionModel, transactionApi } from "#entities/transaction";
import { cardApi } from "#entities/card";
import { createBrowserClient } from "#shared/api/supabase/client";
import { POLLING_INTERVAL } from "#shared/config";

type PaymentState = "idle" | "pending" | "completed" | "failed";

export function useQRPayment() {
  const [state, setState] = useState<PaymentState>("idle");
  const [transaction, setTransaction] =
    useState<transactionModel.Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const user = userModel.useUserStore((s) => s.user);
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (transactionId: string) => {
      const supabase = createBrowserClient();

      intervalRef.current = setInterval(async () => {
        const { data } = await supabase
          .from("transactions")
          .select("status")
          .eq("id", transactionId)
          .single();

        if (data?.status === "completed") {
          setState("completed");
          stopPolling();
        } else if (data?.status === "failed") {
          setState("failed");
          stopPolling();
        }
      }, POLLING_INTERVAL);
    },
    [stopPolling],
  );

  const createPayment = useCallback(
    async (amount: number, merchant: string) => {
      if (!user) return;
      setState("pending");
      setError(null);

      // проверяем месячный лимит карты
      const [{ data: card }, { data: spent }] = await Promise.all([
        cardApi.getCard(user.id),
        transactionApi.getMonthlySpent(user.id),
      ]);
      if (card && spent + amount > card.spending_limit) {
        setState("failed");
        setError("This payment exceeds your monthly card limit");
        return;
      }

      const { data, error } = await qrPaymentApi.create(
        amount,
        merchant,
        user.id,
      );

      if (error || !data) {
        setState("failed");
        setError(error);
        return;
      }

      setTransaction(data);
      addTransaction(data);

      // симулируем подтверждение через 3 сек
      qrPaymentApi.simulateConfirm(data.id);

      // polling каждые 2 сек
      startPolling(data.id);
    },
    [user, startPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setState("idle");
    setTransaction(null);
    setError(null);
  }, [stopPolling]);

  // очищаем при размонтировании
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { state, transaction, error, createPayment, reset };
}
