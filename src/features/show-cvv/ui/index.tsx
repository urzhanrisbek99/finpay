"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { useT } from "#shared/i18n";
import { cardApi } from "#entities/card";

interface ShowCVVModalProps {
  open: boolean;
  onClose: () => void;
  cardId?: string;
}

export function ShowCVVModal({ open, onClose, cardId }: ShowCVVModalProps) {
  const [revealed, setRevealed] = useState(false);
  const [cvv, setCvv] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  const reset = () => {
    setRevealed(false);
    setCvv(null);
    setLoading(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleToggle = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }
    if (cvv !== null) {
      setRevealed(true);
      return;
    }
    if (!cardId) return;

    setLoading(true);
    setError(null);
    const { data, error: apiError } = await cardApi.getCvv(cardId);
    setLoading(false);

    if (apiError || !data) {
      setError(t.cvv.error);
      return;
    }

    setCvv(data);
    setRevealed(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <div className="space-y-4">
          <div>
            <DialogTitle className="text-base font-medium">
              {t.cvv.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-xs">
              {t.cvv.subtitle}
            </DialogDescription>
          </div>

          <div className="bg-muted flex flex-col items-center gap-3 rounded-xl p-6">
            <p className="text-muted-foreground text-xs">{t.cvv.code}</p>
            <div className="font-mono text-3xl font-bold tracking-widest">
              {revealed && cvv ? cvv : "•••"}
            </div>
            <button
              onClick={handleToggle}
              disabled={loading || !cardId}
              className="flex items-center gap-1.5 text-xs text-violet-600 disabled:opacity-50"
            >
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              {loading ? t.cvv.loading : revealed ? t.cvv.hide : t.cvv.reveal}
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <Button
            className="w-full bg-violet-600 hover:bg-violet-700"
            onClick={handleClose}
          >
            {t.common.done}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
