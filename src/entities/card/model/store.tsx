"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { Card } from "./types";

export type CardState = {
  card: Card | null;
  setCard: (card: Card | null) => void;
  toggleFreeze: () => void;
  setSpendingLimit: (spendingLimit: number) => void;
};

export const createCardStore = (initial?: Card | null) =>
  createStore<CardState>((set) => ({
    card: initial ?? null,
    setCard: (card) => set({ card }),
    toggleFreeze: () =>
      set((state) => ({
        card: state.card
          ? { ...state.card, is_frozen: !state.card.is_frozen }
          : null,
      })),
    setSpendingLimit: (spendingLimit) =>
      set((state) => ({
        card: state.card
          ? { ...state.card, spending_limit: spendingLimit }
          : null,
      })),
  }));

export type CardStoreApi = ReturnType<typeof createCardStore>;

const CardStoreContext = createContext<CardStoreApi | null>(null);

export function CardStoreProvider({
  initialCard,
  children,
}: {
  initialCard: Card | null;
  children: ReactNode;
}) {
  const [store] = useState(() => createCardStore(initialCard));
  return (
    <CardStoreContext.Provider value={store}>
      {children}
    </CardStoreContext.Provider>
  );
}

export function useCardStore<T>(selector: (state: CardState) => T): T {
  const store = useContext(CardStoreContext);
  if (!store) {
    throw new Error("useCardStore must be used within a CardStoreProvider");
  }
  return useStore(store, selector);
}
