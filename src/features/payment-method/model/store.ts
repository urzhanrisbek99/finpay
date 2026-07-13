import { create } from "zustand";

type PaymentMethodStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const usePaymentMethodStore = create<PaymentMethodStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
