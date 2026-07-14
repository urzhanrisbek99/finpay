"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { qrPaymentApi } from "../api";
import { userApi, userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
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
  const userStore = userModel.useUserStoreApi();
  const addTransaction = transactionModel.useTransactionStore(
    (s) => s.addTransaction,
  );
  const updateTransactionStatus = transactionModel.useTransactionStore(
    (s) => s.updateTransactionStatus,
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Баланс списывает сервер (confirm_qr_payment). После подтверждения просто
  // подтягиваем авторитетное значение из БД — клиент ничего не считает сам.
  const syncBalance = useCallback(async () => {
    const { user: current, setBalance } = userStore.getState();
    if (!current) return;
    const { data } = await userApi.getProfile(current.id);
    if (data) setBalance(data.balance);
  }, [userStore]);

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
          updateTransactionStatus(transactionId, "completed");
          void syncBalance();
        } else if (data?.status === "failed") {
          setState("failed");
          stopPolling();
          updateTransactionStatus(transactionId, "failed");
        }
      }, POLLING_INTERVAL);
    },
    [stopPolling, syncBalance, updateTransactionStatus],
  );

  const createPayment = useCallback(
    async (amount: number, merchant: string) => {
      if (!user) return;
      // Мгновенный фидбэк; баланс и лимит окончательно проверяет сервер.
      if (amount > user.balance) {
        setState("failed");
        setError("Insufficient balance");
        return;
      }
      setState("pending");
      setError(null);

      const { data, error } = await qrPaymentApi.create(amount, merchant);

      if (error || !data) {
        setState("failed");
        setError(error);
        return;
      }

      setTransaction(data);
      addTransaction(data);

      qrPaymentApi.simulateConfirm(data.id);
      startPolling(data.id);
    },
    [user, addTransaction, startPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setState("idle");
    setTransaction(null);
    setError(null);
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { state, transaction, error, createPayment, reset };
}
