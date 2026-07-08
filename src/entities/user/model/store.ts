import { create } from "zustand";
import type { User } from "./types";

type UserStore = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setBalance: (balance: number) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setBalance: (balance) =>
    set((state) => (state.user ? { user: { ...state.user, balance } } : state)),
  setLoading: (isLoading) => set({ isLoading }),
}));
