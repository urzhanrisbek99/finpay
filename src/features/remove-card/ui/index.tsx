"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { removeCardApi } from "../api";
import { createBrowserClient } from "#shared/api/supabase/client";
import { cardModel, cardApi } from "#entities/card";

interface RemoveCardModalProps {
  open: boolean;
  onClose: () => void;
}

export function RemoveCardModal({ open, onClose }: RemoveCardModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const card = cardModel.useCardStore((s) => s.card);
  const setCard = cardModel.useCardStore((s) => s.setCard);

  const handleConfirm = async () => {
    if (!card) return;
    setIsLoading(true);

    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // сохраняем запрос в БД
    await removeCardApi.request(user.id, card.id);
    // реально удаляем карту
    await cardApi.deleteCard(card.id);
    setCard(null);
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
              <h2 className="text-base font-medium">Remove card</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                This action cannot be undone
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs text-red-700">
                Are you sure you want to remove card ending in {card?.number}?
                All pending transactions will be cancelled.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Removing..." : "Remove card"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">Request submitted!</h2>
            <p className="text-muted-foreground text-center text-sm">
              Your card removal request has been submitted
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
