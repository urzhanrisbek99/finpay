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
import { useT } from "#shared/i18n";
import { cardModel, cardApi } from "#entities/card";

interface RemoveCardModalProps {
  open: boolean;
  onClose: () => void;
}

// Удаление — действие самого владельца, оно выполняется сразу. Заявка
// оператору здесь не заводится (в отличие от перевыпуска, который реально
// занимает дни): раньше модалка делала и то и другое — писала pending-заявку
// и тут же сносила карту, а экран успеха сообщал про «отправленную заявку».
export function RemoveCardModal({ open, onClose }: RemoveCardModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const card = cardModel.useCardStore((s) => s.card);
  const setCard = cardModel.useCardStore((s) => s.setCard);
  const t = useT();

  const handleConfirm = async () => {
    if (!card) return;
    setIsLoading(true);
    setError(false);

    const { error: apiError } = await cardApi.deleteCard(card.id);
    setIsLoading(false);

    if (apiError) {
      console.error("[remove-card] delete failed:", apiError);
      setError(true);
      return;
    }

    setCard(null);
    setConfirmed(true);
  };

  const handleClose = () => {
    setConfirmed(false);
    setError(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {!confirmed ? (
          <div className="space-y-4">
            <div>
              <DialogTitle className="text-base font-medium">
                {t.removeCard.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-xs">
                {t.removeCard.subtitle}
              </DialogDescription>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs text-red-700">
                {t.removeCard.notice(card?.number ?? "")}
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-500">{t.removeCard.error}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                {t.common.cancel}
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? t.removeCard.removing : t.removeCard.remove}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <DialogTitle className="text-base font-medium">
              {t.removeCard.successTitle}
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm">
              {t.removeCard.successBody}
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
