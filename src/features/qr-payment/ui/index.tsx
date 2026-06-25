"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/src/shared/ui/dialog";
import { Button } from "@/src/shared/ui/button";
import { Input } from "@/src/shared/ui/input";
import { Label } from "@/src/shared/ui/label";
import { useQRPayment } from "../model/useQRPayment";
import { formatCurrency } from "@/src/shared/lib/formatters";

interface QRModalProps {
  open: boolean;
  onClose: () => void;
}

export function QRModal({ open, onClose }: QRModalProps) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const { state, transaction, error, createPayment, reset } = useQRPayment();

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
              <h2 className="text-base font-medium">QR Payment</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Enter amount and merchant to generate QR
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Amount (₸)</Label>
              <Input
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Merchant</Label>
              <Input
                placeholder="Halyk Market"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleCreate}
              disabled={!amount || !merchant}
            >
              Generate QR
            </Button>
          </div>
        )}

        {state === "pending" && transaction && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div>
              <h2 className="text-center text-base font-medium">Scan to pay</h2>
              <p className="text-muted-foreground mt-1 text-center text-xs">
                {formatCurrency(transaction.amount)} → {transaction.merchant}
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
              Waiting for payment...
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Payment will be confirmed automatically in 3 seconds
            </p>
          </div>
        )}

        {state === "completed" && transaction && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">Payment successful!</h2>
            <p className="text-muted-foreground text-sm">
              {formatCurrency(transaction.amount)} paid to{" "}
              {transaction.merchant}
            </p>
            <Button
              className="mt-2 w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        )}

        {state === "failed" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <XCircle size={48} className="text-red-500" />
            <h2 className="text-base font-medium">Payment failed</h2>
            <p className="text-muted-foreground text-xs">{error}</p>
            <Button variant="outline" className="mt-2 w-full" onClick={reset}>
              Try again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
