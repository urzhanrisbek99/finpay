"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { User } from "./types";

export type UserState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setBalance: (balance: number) => void;
  setLoading: (isLoading: boolean) => void;
};

// Per-request фабрика: один стор на дерево рендера, а не синглтон на процесс —
// иначе при SSR состояние утекало бы между запросами разных пользователей.
export const createUserStore = (
  initial?: Partial<Pick<UserState, "user" | "isLoading">>,
) =>
  createStore<UserState>((set) => ({
    user: initial?.user ?? null,
    isLoading: initial?.isLoading ?? true,
    setUser: (user) => set({ user }),
    setBalance: (balance) =>
      set((state) =>
        state.user ? { user: { ...state.user, balance } } : state,
      ),
    setLoading: (isLoading) => set({ isLoading }),
  }));

export type UserStoreApi = ReturnType<typeof createUserStore>;

const UserStoreContext = createContext<UserStoreApi | null>(null);

export function UserStoreProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  const [store] = useState(() =>
    createUserStore({ user: initialUser, isLoading: false }),
  );
  return (
    <UserStoreContext.Provider value={store}>
      {children}
    </UserStoreContext.Provider>
  );
}

export function useUserStoreApi(): UserStoreApi {
  const store = useContext(UserStoreContext);
  if (!store) {
    throw new Error("useUserStore must be used within a UserStoreProvider");
  }
  return store;
}

export function useUserStore<T>(selector: (state: UserState) => T): T {
  return useStore(useUserStoreApi(), selector);
}
