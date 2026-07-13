import { create } from "zustand";
import type { TransactionStatus } from "#shared/types";
import type { Transaction } from "./types";

type TransactionStore = {
  transactions: Transaction[];
  isLoading: boolean;
  hasLoaded: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoading: true,
  hasLoaded: false,
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
