"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { createBrowserClient } from "#shared/api";
import { useT, type Messages } from "#shared/i18n";
import { cardModel, type Card } from "#entities/card";
import { addCardApi, type AddCardInput } from "../api";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

function detectBrand(digits: string): Card["type"] | null {
  if (digits.startsWith("4")) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "mastercard";
  return null;
}

function formatNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

function toFriendlyError(message: string, t: Messages): string {
  if (/duplicate|unique/i.test(message)) return t.addCard.errors.duplicate;
  return t.addCard.errors.generic;
}

export function AddCardModal({ open, onClose }: AddCardModalProps) {
  const setCard = cardModel.useCardStore((s) => s.setCard);
  const t = useT();

  const [number, setNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [limit, setLimit] = useState("500000");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const digits = number.replace(/\D/g, "");
  const brand = detectBrand(digits);

  const reset = () => {
    setNumber("");
    setHolderName("");
    setExpiry("");
    setCvv("");
    setLimit("500000");
    setError(null);
    setConfirmed(false);
    setIsLoading(false);
  };

  const validate = ():
    | { ok: true; value: AddCardInput }
    | { ok: false; error: string } => {
    if (digits.length !== 16)
      return { ok: false, error: t.addCard.errors.invalidNumber };
    if (!brand) return { ok: false, error: t.addCard.errors.unsupported };

    const holder = holderName.trim();
    if (!holder) return { ok: false, error: t.addCard.errors.noHolder };

    const [mm, yy] = expiry.split("/");
    const month = Number(mm);
    if (expiry.replace(/\D/g, "").length !== 4 || month < 1 || month > 12)
      return { ok: false, error: t.addCard.errors.invalidExpiry };
    // конец указанного месяца: new Date(y, month, 0) = последний день месяца
    const expDate = new Date(2000 + Number(yy), month, 0, 23, 59, 59);
    if (expDate < new Date())
      return { ok: false, error: t.addCard.errors.expired };

    if (cvv.length !== 3)
      return { ok: false, error: t.addCard.errors.invalidCvv };

    const spendingLimit = Number(limit);
    if (!spendingLimit || spendingLimit <= 0)
      return { ok: false, error: t.addCard.errors.invalidLimit };

    return {
      ok: true,
      value: {
        number: digits,
        cvv,
        holder_name: holder,
        expires_at: expiry,
        type: brand,
        spending_limit: spendingLimit,
      },
    };
  };

  const handleSubmit = async () => {
    const result = validate();
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setIsLoading(true);

    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError(t.addCard.errors.notSignedIn);
      setIsLoading(false);
      return;
    }

    const { data, error: apiError } = await addCardApi.create(
      user.id,
      result.value,
    );

    if (apiError || !data) {
      if (apiError) console.error("[add-card] create failed:", apiError);
      setError(
        apiError ? toFriendlyError(apiError, t) : t.addCard.errors.generic,
      );
      setIsLoading(false);
      return;
    }

    setCard(data);
    setConfirmed(true);
    setIsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {!confirmed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <DialogTitle className="text-base font-medium">
                {t.addCard.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-xs">
                {t.addCard.subtitle}
              </DialogDescription>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number">{t.addCard.cardNumber}</Label>
              <div className="relative">
                <Input
                  id="card-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={number}
                  onChange={(e) => setNumber(formatNumber(e.target.value))}
                />
                {brand && (
                  <span className="text-muted-foreground absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-medium uppercase">
                    {brand}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="holder-name">{t.addCard.cardHolder}</Label>
              <Input
                id="holder-name"
                autoComplete="cc-name"
                placeholder="JOHN DOE"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value.toUpperCase())}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="expiry">{t.addCard.expiry}</Label>
                <Input
                  id="expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="cvv">{t.addCard.cvv}</Label>
                <Input
                  id="cvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spending-limit">{t.addCard.spendingLimit}</Label>
              <Input
                id="spending-limit"
                inputMode="numeric"
                placeholder="500000"
                value={limit}
                onChange={(e) =>
                  setLimit(e.target.value.replace(/\D/g, "").slice(0, 9))
                }
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                disabled={isLoading}
              >
                {isLoading ? t.addCard.adding : t.addCard.add}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <DialogTitle className="text-base font-medium">
              {t.addCard.successTitle}
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm">
              {t.addCard.successBody}
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
