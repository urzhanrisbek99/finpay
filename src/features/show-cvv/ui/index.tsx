"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
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
    // CVV уже загружали в этой сессии — не дёргаем сервер повторно
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
      setError("Could not load CVV. Please try again");
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
            <h2 className="text-base font-medium">Card CVV</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Never share your CVV with anyone
            </p>
          </div>

          <div className="bg-muted flex flex-col items-center gap-3 rounded-xl p-6">
            <p className="text-muted-foreground text-xs">CVV code</p>
            <div className="font-mono text-3xl font-bold tracking-widest">
              {revealed && cvv ? cvv : "•••"}
            </div>
            <button
              onClick={handleToggle}
              disabled={loading || !cardId}
              className="flex items-center gap-1.5 text-xs text-violet-600 disabled:opacity-50"
            >
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              {loading ? "Loading..." : revealed ? "Hide" : "Reveal CVV"}
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <Button
            className="w-full bg-violet-600 hover:bg-violet-700"
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
