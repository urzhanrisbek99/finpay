"use client";

import { useState } from "react";
import {
  PaymentMethodModal,
  usePaymentMethodStore,
} from "#features/payment-method";
import { QRModal } from "#features/qr-payment";
import { TransferModal } from "#features/transfer";
import { CardTransferModal } from "#features/transfer-by-card";

export function NewPaymentFlow() {
  const isOpen = usePaymentMethodStore((s) => s.isOpen);
  const close = usePaymentMethodStore((s) => s.close);
  const [qrOpen, setQrOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

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
        onSelectCard={() => {
          close();
          setCardOpen(true);
        }}
      />

      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
      <CardTransferModal open={cardOpen} onClose={() => setCardOpen(false)} />
    </>
  );
}
