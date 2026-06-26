"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/src/shared/ui/dialog";
import { Button } from "@/src/shared/ui/button";
import { reissueCardApi } from "../api";
import { createClient } from "@/src/shared/api/supabase/client";
import { useCardStore } from "@/src/entities/card/model/store";

interface ReissueCardModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReissueCardModal({ open, onClose }: ReissueCardModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const card = useCardStore((s) => s.card);

  const handleConfirm = async () => {
    if (!card) return;
    setIsLoading(true);

    const supabase = createClient();
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
              <h2 className="text-base font-medium">Reissue card</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Your current card will be deactivated
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">
                A new card will be issued within 3-5 business days. Your current
                card will remain active until the new one is activated.
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
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Confirm"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">Request submitted!</h2>
            <p className="text-muted-foreground text-center text-sm">
              Your new card will arrive within 3-5 business days
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
