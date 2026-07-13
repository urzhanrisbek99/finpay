import { create } from "zustand";

// глобальное состояние флоу «New payment»: открывается из хэдера (любой
// страницы), сам флоу смонтирован один раз в оболочке приложения
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
