"use client";

import { useState } from "react";
import {
  PaymentMethodModal,
  usePaymentMethodStore,
} from "#features/payment-method";
import { QRModal } from "#features/qr-payment";
import { TransferModal } from "#features/transfer";

// Единый флоу «New payment» для всего приложения: смонтирован один раз в
// оболочке, открывается из глобального хэдера через usePaymentMethodStore.
// Выбор метода → соответствующая модалка (QR / перевод по телефону).
export function NewPaymentFlow() {
  const isOpen = usePaymentMethodStore((s) => s.isOpen);
  const close = usePaymentMethodStore((s) => s.close);
  const [qrOpen, setQrOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <>
      <PaymentMethodModal
        open={isOpen}
        onClose={close}
        onSelectQr={() => {
          close();
          setQrOpen(true);
        }}
        onSelectTransfer={() => {
          close();
          setTransferOpen(true);
        }}
      />

      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </>
  );
}
