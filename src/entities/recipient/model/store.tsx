"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { Recipient } from "./types";

export type RecipientState = {
  recipients: Recipient[];
  isLoading: boolean;
  hasLoaded: boolean;
  setRecipients: (recipients: Recipient[]) => void;
  upsertRecipient: (recipient: Recipient) => void;
  setLoading: (isLoading: boolean) => void;
};

export const createRecipientStore = (initial?: Recipient[]) =>
  createStore<RecipientState>((set) => ({
    recipients: initial ?? [],
    isLoading: initial ? false : true,
    hasLoaded: initial ? true : false,
    setRecipients: (recipients) => set({ recipients, hasLoaded: true }),
    setLoading: (isLoading) => set({ isLoading }),
    upsertRecipient: (recipient) =>
      set((state) => ({
        recipients: [
          recipient,
          ...state.recipients.filter((r) => r.phone !== recipient.phone),
        ],
      })),
  }));

export type RecipientStoreApi = ReturnType<typeof createRecipientStore>;

const RecipientStoreContext = createContext<RecipientStoreApi | null>(null);

export function RecipientStoreProvider({
  initialRecipients,
  children,
}: {
  initialRecipients: Recipient[];
  children: ReactNode;
}) {
  const [store] = useState(() => createRecipientStore(initialRecipients));
  return (
    <RecipientStoreContext.Provider value={store}>
      {children}
    </RecipientStoreContext.Provider>
  );
}

export function useRecipientStoreApi(): RecipientStoreApi {
  const store = useContext(RecipientStoreContext);
  if (!store) {
    throw new Error(
      "useRecipientStore must be used within a RecipientStoreProvider",
    );
  }
  return store;
}

export function useRecipientStore<T>(
  selector: (state: RecipientState) => T,
): T {
  return useStore(useRecipientStoreApi(), selector);
}
