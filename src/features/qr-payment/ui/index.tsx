"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { useQRPayment } from "../model";
import { formatCurrency } from "#shared/lib";
import { useT } from "#shared/i18n";

interface QRModalProps {
  open: boolean;
  onClose: () => void;
}

export function QRModal({ open, onClose }: QRModalProps) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const { state, transaction, error, createPayment, reset } = useQRPayment();
  const t = useT();

  const handleClose = () => {
    reset();
    setAmount("");
    setMerchant("");
    onClose();
  };

  const handleCreate = () => {
    if (!amount || !merchant) return;
    createPayment(Number(amount), merchant);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {state === "idle" && (
          <div className="space-y-4">
            <div>
              <DialogTitle className="text-base font-medium">
                {t.qr.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-xs">
                {t.qr.subtitle}
              </DialogDescription>
            </div>

            <div className="space-y-1.5">
              <Label>{t.qr.amount}</Label>
              <Input
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t.qr.merchant}</Label>
              <Input
                placeholder={t.qr.merchantPlaceholder}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleCreate}
              disabled={!amount || !merchant}
            >
              {t.qr.generate}
            </Button>
          </div>
        )}

        {state === "pending" && transaction && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div>
              <DialogTitle className="text-center text-base font-medium">
                {t.qr.scanTitle}
              </DialogTitle>
              <p className="text-muted-foreground mt-1 text-center text-xs">
                {t.qr.scanSubtitle(
                  formatCurrency(transaction.amount),
                  transaction.merchant,
                )}
              </p>
            </div>

            <div className="rounded-xl border p-3">
              <QRCodeSVG
                value={`finpay:payment:${transaction.id}`}
                size={180}
                level="M"
              />
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 size={14} className="animate-spin" />
              {t.qr.waiting}
            </div>

            <p className="text-muted-foreground text-center text-xs">
              {t.qr.autoConfirm}
            </p>
          </div>
        )}

        {state === "completed" && transaction && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <DialogTitle className="text-base font-medium">
              {t.qr.successTitle}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {t.qr.paidTo(
                formatCurrency(transaction.amount),
                transaction.merchant,
              )}
            </p>
            <Button
              className="mt-2 w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleClose}
            >
              {t.common.done}
            </Button>
          </div>
        )}

        {state === "failed" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <XCircle size={48} className="text-red-500" />
            <DialogTitle className="text-base font-medium">
              {t.qr.failedTitle}
            </DialogTitle>
            <p className="text-muted-foreground text-xs">{error}</p>
            <Button variant="outline" className="mt-2 w-full" onClick={reset}>
              {t.common.tryAgain}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
