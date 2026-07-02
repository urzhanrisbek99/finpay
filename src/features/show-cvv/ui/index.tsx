"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";

interface ShowCVVModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShowCVVModal({ open, onClose }: ShowCVVModalProps) {
  const [revealed, setRevealed] = useState(false);

  const handleClose = () => {
    setRevealed(false);
    onClose();
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
              {revealed ? "123" : "•••"}
            </div>
            <button
              onClick={() => setRevealed(!revealed)}
              className="flex items-center gap-1.5 text-xs text-violet-600"
            >
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              {revealed ? "Hide" : "Reveal CVV"}
            </button>
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
