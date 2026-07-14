import { create } from "zustand";
import type { Recipient } from "./types";

type RecipientStore = {
  recipients: Recipient[];
  isLoading: boolean;
  hasLoaded: boolean;
  setRecipients: (recipients: Recipient[]) => void;
  upsertRecipient: (recipient: Recipient) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useRecipientStore = create<RecipientStore>((set) => ({
  recipients: [],
  isLoading: true,
  hasLoaded: false,
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
