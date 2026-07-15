"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { useT } from "#shared/i18n";
import { cardModel, cardApi } from "#entities/card";

interface SetSpendingLimitModalProps {
  open: boolean;
  onClose: () => void;
}

export function SetSpendingLimitModal({
  open,
  onClose,
}: SetSpendingLimitModalProps) {
  const card = cardModel.useCardStore((s) => s.card);
  const setSpendingLimit = cardModel.useCardStore((s) => s.setSpendingLimit);

  const [limit, setLimit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && card) {
      setLimit(String(card.spending_limit));
      setError(null);
    }
  }

  const handleSave = async () => {
    if (!card) return;

    const value = Number(limit);
    if (!value || value <= 0) {
      setError(t.spendingLimit.error);
      return;
    }

    setError(null);
    setIsLoading(true);

    const { error: apiError } = await cardApi.updateSpendingLimit(
      card.id,
      value,
    );
    if (apiError) {
      console.error("[set-spending-limit] update failed:", apiError);
      setError(t.spendingLimit.updateError);
      setIsLoading(false);
      return;
    }

    setSpendingLimit(value);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-base font-medium">{t.spendingLimit.title}</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {t.spendingLimit.subtitle}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">{t.spendingLimit.limit}</Label>
            <Input
              id="limit"
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
              onClick={onClose}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-700"
              disabled={isLoading}
            >
              {isLoading ? t.common.saving : t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
