import { create } from "zustand";
import type { Card } from "./types";

type CardStore = {
  card: Card | null;
  isLoading: boolean;
  setCard: (card: Card | null) => void;
  setLoading: (isLoading: boolean) => void;
  toggleFreeze: () => void;
};

export const useCardStore = create<CardStore>((set) => ({
  card: null,
  isLoading: false,
  setCard: (card) => set({ card }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleFreeze: () =>
    set((state) => ({
      card: state.card
        ? { ...state.card, is_frozen: !state.card.is_frozen }
        : null,
    })),
}));
