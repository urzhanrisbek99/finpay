import { create } from "zustand";
import type { TransactionStatus } from "#shared/types";
import type { Transaction } from "./types";

type TransactionStore = {
  transactions: Transaction[];
  isLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoading: true,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateTransactionStatus: (id, status) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, status } : tx,
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
