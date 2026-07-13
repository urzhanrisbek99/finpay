import { create } from "zustand";
import type { Recipient } from "./types";

type RecipientStore = {
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  upsertRecipient: (recipient: Recipient) => void;
};

export const useRecipientStore = create<RecipientStore>((set) => ({
  recipients: [],
  setRecipients: (recipients) => set({ recipients }),
  upsertRecipient: (recipient) =>
    set((state) => ({
      recipients: [
        recipient,
        ...state.recipients.filter((r) => r.phone !== recipient.phone),
      ],
    })),
}));
