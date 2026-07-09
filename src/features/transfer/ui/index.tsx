"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { useTransfer } from "../model";
import { formatCurrency, formatPhone, isValidPhone } from "#shared/lib";

const QUICK_AMOUNTS = [5000, 10000, 30000, 50000];

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransferModal({ open, onClose }: TransferModalProps) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const { state, error, send, reset } = useTransfer();

  const phoneValid = isValidPhone(phone);
  // показываем ошибку формата только когда что-то введено, но номер ещё неполон
  const phoneError = phone.length > 0 && !phoneValid;

  const handleClose = () => {
    reset();
    setPhone("");
    setAmount("");
    setComment("");
    onClose();
  };

  const handleSend = () => {
    if (!phoneValid || !amount) return;
    send(Number(amount), `+7${phone}`, comment);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {(state === "idle" || state === "failed") && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium">Transfer by phone</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Send money instantly to any number
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <div className="flex">
                <span className="bg-muted text-muted-foreground flex items-center rounded-l-lg border border-r-0 px-3 text-sm">
                  +7
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(702) 000-00-00"
                  value={formatPhone(phone)}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  aria-invalid={phoneError}
                  className="rounded-l-none"
                />
              </div>
              {phoneError && (
                <p className="text-xs text-red-600">
                  Enter a valid number: +7 7XX XXX XX XX
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Amount (₸)</Label>
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
              <Label>Comment (optional)</Label>
              <Input
                placeholder="For dinner"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleSend}
              disabled={!phoneValid || !amount}
            >
              Send {amount ? formatCurrency(Number(amount)) : ""}
            </Button>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={32} className="animate-spin text-violet-600" />
            <p className="text-muted-foreground text-sm">Sending transfer...</p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">Transfer successful!</h2>
            <p className="text-muted-foreground text-center text-sm">
              {formatCurrency(Number(amount))} sent to +7 {formatPhone(phone)}
            </p>
            <Button
              className="mt-2 w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
