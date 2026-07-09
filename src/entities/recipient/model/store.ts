import { create } from "zustand";
import type { Recipient } from "./types";

type RecipientStore = {
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  // добавляет получателя наверх, не создавая дубль по phone
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
