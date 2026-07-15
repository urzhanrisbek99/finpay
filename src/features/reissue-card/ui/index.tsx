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
import { reissueCardApi } from "../api";
import { useT } from "#shared/i18n";
import { cardModel } from "#entities/card";
import { userModel } from "#entities/user";

interface ReissueCardModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReissueCardModal({ open, onClose }: ReissueCardModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const card = cardModel.useCardStore((s) => s.card);
  // Профиль уже гидрирован из SSR — отдельный getUser() по сети не нужен.
  const user = userModel.useUserStore((s) => s.user);
  const t = useT();

  const handleConfirm = async () => {
    if (!card || !user) return;
    setIsLoading(true);
    setError(false);

    const { error: apiError } = await reissueCardApi.request(user.id, card.id);
    setIsLoading(false);

    if (apiError) {
      console.error("[reissue-card] request failed:", apiError);
      setError(true);
      return;
    }

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
                {t.reissue.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-xs">
                {t.reissue.subtitle}
              </DialogDescription>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">{t.reissue.notice}</p>
            </div>

            {error && <p className="text-xs text-red-500">{t.reissue.error}</p>}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                {t.common.cancel}
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? t.reissue.submitting : t.common.confirm}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <DialogTitle className="text-base font-medium">
              {t.reissue.successTitle}
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm">
              {t.reissue.successBody}
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
