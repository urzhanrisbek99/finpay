"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { reissueCardApi } from "../api";
import { createBrowserClient } from "#shared/api/supabase/client";
import { useT } from "#shared/i18n";
import { cardModel } from "#entities/card";

interface ReissueCardModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReissueCardModal({ open, onClose }: ReissueCardModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const card = cardModel.useCardStore((s) => s.card);
  const t = useT();

  const handleConfirm = async () => {
    if (!card) return;
    setIsLoading(true);

    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await reissueCardApi.request(user.id, card.id);
    setConfirmed(true);
    setIsLoading(false);
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {!confirmed ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium">{t.reissue.title}</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {t.reissue.subtitle}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">{t.reissue.notice}</p>
            </div>

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
            <h2 className="text-base font-medium">{t.reissue.successTitle}</h2>
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
