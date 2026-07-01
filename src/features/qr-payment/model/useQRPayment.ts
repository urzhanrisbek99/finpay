"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { qrPaymentApi } from "../api";
import { userModel } from "@/src/entities/user";
import { transactionModel } from "@/src/entities/transaction";
import { createBrowserClient } from "@/src/shared/api/supabase/client";
import { POLLING_INTERVAL } from "@/src/shared/config";

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
    (transactionId: string, txData: transactionModel.Transaction) => {
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
      startPolling(data.id, data);
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
