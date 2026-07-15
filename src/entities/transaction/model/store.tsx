"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { TransactionStatus } from "#shared/model";
import type { Transaction } from "./types";

export type TransactionState = {
  transactions: Transaction[];
  isLoading: boolean;
  hasLoaded: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
};

export const createTransactionStore = (initial?: Transaction[]) =>
  createStore<TransactionState>((set) => ({
    transactions: initial ?? [],
    isLoading: initial ? false : true,
    hasLoaded: initial ? true : false,
    setTransactions: (transactions) => set({ transactions, hasLoaded: true }),
    addTransaction: (transaction) =>
      set((state) => ({ transactions: [transaction, ...state.transactions] })),
    updateTransactionStatus: (id, status) =>
      set((state) => ({
        transactions: state.transactions.map((tx) =>
          tx.id === id ? { ...tx, status } : tx,
        ),
      })),
    setLoading: (isLoading) => set({ isLoading }),
    reset: () => set({ transactions: [], isLoading: true, hasLoaded: false }),
  }));

export type TransactionStoreApi = ReturnType<typeof createTransactionStore>;

const TransactionStoreContext = createContext<TransactionStoreApi | null>(null);

export function TransactionStoreProvider({
  initialTransactions,
  children,
}: {
  initialTransactions: Transaction[];
  children: ReactNode;
}) {
  const [store] = useState(() => createTransactionStore(initialTransactions));
  return (
    <TransactionStoreContext.Provider value={store}>
      {children}
    </TransactionStoreContext.Provider>
  );
}

export function useTransactionStoreApi(): TransactionStoreApi {
  const store = useContext(TransactionStoreContext);
  if (!store) {
    throw new Error(
      "useTransactionStore must be used within a TransactionStoreProvider",
    );
  }
  return store;
}

export function useTransactionStore<T>(
  selector: (state: TransactionState) => T,
): T {
  return useStore(useTransactionStoreApi(), selector);
}
