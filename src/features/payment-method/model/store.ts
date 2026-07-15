import { create } from "zustand";

// Единственный стор, оставленный синглтоном на модуле, — и это осознанно.
// Сторы с данными (user/transaction/recipient/card) создаются на запрос через
// Context: синглтон жил бы в процессе Node и протекал бы между запросами
// разных пользователей при SSR. Здесь протекать нечему: стор держит только
// «открыта ли модалка выбора способа оплаты» — эфемерное состояние UI, оно не
// выводится из данных пользователя и никогда не пишется во время серверного
// рендера (open/close зовутся только из onClick). Любой SSR читает false.
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
