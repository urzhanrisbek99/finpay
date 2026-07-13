"use client";

import { QrCode, Smartphone, CreditCard } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onSelectQr: () => void;
  onSelectTransfer: () => void;
  onSelectCard: () => void;
}

export function PaymentMethodModal({
  open,
  onClose,
  onSelectQr,
  onSelectTransfer,
  onSelectCard,
}: PaymentMethodModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-medium">New payment</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Choose how you want to pay
            </p>
          </div>

          <div className="grid gap-2">
            <button
              onClick={onSelectQr}
              className="hover:bg-muted-foreground/10 flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <QrCode size={18} />
              </span>
              <span>
                <span className="block text-sm font-medium">QR payment</span>
                <span className="text-muted-foreground block text-xs">
                  Pay a merchant by generating a QR code
                </span>
              </span>
            </button>

            <button
              onClick={onSelectTransfer}
              className="hover:bg-muted-foreground/10 flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Smartphone size={18} />
              </span>
              <span>
                <span className="block text-sm font-medium">
                  Transfer by phone
                </span>
                <span className="text-muted-foreground block text-xs">
                  Send money to a contact&apos;s phone number
                </span>
              </span>
            </button>

            <button
              onClick={onSelectCard}
              className="hover:bg-muted-foreground/10 flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CreditCard size={18} />
              </span>
              <span>
                <span className="block text-sm font-medium">
                  Transfer by card
                </span>
                <span className="text-muted-foreground block text-xs">
                  Send money to any card number
                </span>
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
