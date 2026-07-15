"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { useTransfer } from "../model";
import { recipientModel } from "#entities/recipient";
import { formatCurrency, formatPhone, isValidPhone } from "#shared/lib";
import { useT } from "#shared/i18n";

const QUICK_AMOUNTS = [5000, 10000, 30000, 50000];

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  initialPhone?: string;
}

export function TransferModal({
  open,
  onClose,
  initialPhone,
}: TransferModalProps) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [saveName, setSaveName] = useState("");
  const [nameAutoFilled, setNameAutoFilled] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const { state, error, send, reset } = useTransfer();
  const recipients = recipientModel.useRecipientStore((s) => s.recipients);
  const t = useT();

  // правка состояния во время рендера (вместо эффекта): на переходе
  // закрыто→открыто подставляем номер и имя уже сохранённого получателя
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const initial = initialPhone ?? "";
      const match = recipients.find((r) => r.phone === initial);
      setPhone(initial);
      setSaveName(match?.name ?? "");
      setNameAutoFilled(!!match);
    }
  }

  const phoneValid = isValidPhone(phone);
  const phoneError = phone.length > 0 && !phoneValid;
  const alreadySaved = recipients.some((r) => r.phone === phone);

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    const match = recipients.find((r) => r.phone === digits);
    if (match) {
      setSaveName(match.name);
      setNameAutoFilled(true);
    } else if (nameAutoFilled) {
      setSaveName("");
      setNameAutoFilled(false);
    }
  };

  const handleNameChange = (value: string) => {
    setSaveName(value);
    setNameAutoFilled(false);
  };

  const handleClose = () => {
    reset();
    setPhone("");
    setAmount("");
    setComment("");
    setSaveName("");
    setNameAutoFilled(false);
    onClose();
  };

  const handleSend = () => {
    if (!phoneValid || !amount) return;
    send(Number(amount), `+7${phone}`, comment, saveName);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {(state === "idle" || state === "failed") && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium">{t.transfer.title}</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {t.transfer.subtitle}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>{t.transfer.phone}</Label>
              <div className="flex">
                <span className="bg-muted text-muted-foreground flex items-center rounded-l-lg border border-r-0 px-3 text-sm">
                  +7
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(702) 000-00-00"
                  value={formatPhone(phone)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  aria-invalid={phoneError}
                  className="rounded-l-none"
                />
              </div>
              {phoneError && (
                <p className="text-xs text-red-600">{t.transfer.phoneError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>{t.transfer.amount}</Label>
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
              <Label>{t.transfer.comment}</Label>
              <Input
                placeholder={t.transfer.commentPlaceholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {phoneValid && (
              <div className="space-y-1.5">
                <Label>
                  {alreadySaved ? t.transfer.recipientName : t.transfer.saveAs}
                </Label>
                <Input
                  placeholder={t.transfer.namePlaceholder}
                  value={saveName}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
                {!alreadySaved && saveName.trim() && (
                  <p className="text-muted-foreground text-xs">
                    {t.transfer.willAddRecipient}
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleSend}
              disabled={!phoneValid || !amount}
            >
              {t.transfer.send} {amount ? formatCurrency(Number(amount)) : ""}
            </Button>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={32} className="animate-spin text-violet-600" />
            <p className="text-muted-foreground text-sm">
              {t.transfer.sending}
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">{t.transfer.success}</h2>
            <p className="text-muted-foreground text-center text-sm">
              {t.transfer.sentTo(
                formatCurrency(Number(amount)),
                formatPhone(phone),
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
      </DialogContent>
    </Dialog>
  );
}
