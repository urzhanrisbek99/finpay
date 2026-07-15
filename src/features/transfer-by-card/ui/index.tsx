"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { useCardTransfer } from "../model";
import {
  formatCurrency,
  formatCardInput,
  isValidCardNumber,
} from "#shared/lib";
import { useT } from "#shared/i18n";

const QUICK_AMOUNTS = [5000, 10000, 30000, 50000];

interface CardTransferModalProps {
  open: boolean;
  onClose: () => void;
}

export function CardTransferModal({ open, onClose }: CardTransferModalProps) {
  const [cardDigits, setCardDigits] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const { state, error, send, reset } = useCardTransfer();
  const t = useT();

  const cardValid = isValidCardNumber(cardDigits);

  const handleCardChange = (raw: string) => {
    setCardDigits(raw.replace(/\D/g, "").slice(0, 16));
  };

  const handleClose = () => {
    reset();
    setCardDigits("");
    setAmount("");
    setComment("");
    onClose();
  };

  const handleSend = () => {
    if (!cardValid || !amount) return;
    send(Number(amount), cardDigits, comment);
  };

  const last4 = cardDigits.slice(-4);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {(state === "idle" || state === "failed") && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium">{t.cardTransfer.title}</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {t.cardTransfer.subtitle}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>{t.cardTransfer.cardNumber}</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="4821 1234 5678 9012"
                value={formatCardInput(cardDigits)}
                onChange={(e) => handleCardChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t.cardTransfer.amount}</Label>
              <Input
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className="bg-muted hover:bg-muted/80 rounded-full px-3 py-1 text-xs transition-colors"
                  >
                    {formatCurrency(a)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t.cardTransfer.comment}</Label>
              <Input
                placeholder={t.cardTransfer.commentPlaceholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleSend}
              disabled={!cardValid || !amount}
            >
              {t.cardTransfer.send}{" "}
              {amount ? formatCurrency(Number(amount)) : ""}
            </Button>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={32} className="animate-spin text-violet-600" />
            <p className="text-muted-foreground text-sm">
              {t.cardTransfer.sending}
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">{t.cardTransfer.success}</h2>
            <p className="text-muted-foreground text-center text-sm">
              {t.cardTransfer.sentTo(formatCurrency(Number(amount)), last4)}
            </p>
            <Button
              className="mt-2 w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleClose}
            >
              {t.common.done}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
