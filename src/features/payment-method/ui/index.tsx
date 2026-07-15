"use client";

import { QrCode, Smartphone, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "#shared/ui/dialog";
import { useT } from "#shared/i18n";

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
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="space-y-4">
          <div>
            <DialogTitle className="text-base font-medium">
              {t.paymentMethod.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-xs">
              {t.paymentMethod.subtitle}
            </DialogDescription>
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
                <span className="block text-sm font-medium">
                  {t.paymentMethod.qrTitle}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {t.paymentMethod.qrDesc}
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
                  {t.paymentMethod.phoneTitle}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {t.paymentMethod.phoneDesc}
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
                  {t.paymentMethod.cardTitle}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {t.paymentMethod.cardDesc}
                </span>
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
