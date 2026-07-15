"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { formatCurrency } from "#shared/lib";
import { useT } from "#shared/i18n";
import type { TransactionCategory } from "#shared/model";
import { useAddIncome } from "../model";

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000];

const CATEGORY_KEYS = ["salary", "other"] as const;

interface AddIncomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddIncomeModal({ open, onClose }: AddIncomeModalProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("salary");
  const { state, error, add, reset } = useAddIncome();
  const t = useT();

  const handleClose = () => {
    reset();
    setAmount("");
    setSource("");
    setCategory("salary");
    onClose();
  };

  const handleAdd = () => {
    if (!amount) return;
    add(Number(amount), source, category);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {(state === "idle" || state === "failed") && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium">{t.addIncome.title}</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {t.addIncome.subtitle}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>{t.addIncome.amount}</Label>
              <Input
                type="number"
                placeholder="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className="bg-muted hover:bg-muted/80 rounded-full px-3 py-1 text-xs transition-colors"
                  >
                    {formatCurrency(a)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t.addIncome.source}</Label>
              <Input
                placeholder={t.addIncome.sourcePlaceholder}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t.addIncome.category}</Label>
              <div className="flex gap-2">
                {CATEGORY_KEYS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      category === c
                        ? "bg-violet-100 text-violet-600"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.addIncome.categories[c]}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleAdd}
              disabled={!amount}
            >
              {amount
                ? t.addIncome.addCta(formatCurrency(Number(amount)))
                : t.addIncome.addFallback}
            </Button>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={32} className="animate-spin text-violet-600" />
            <p className="text-muted-foreground text-sm">
              {t.addIncome.adding}
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">
              {t.addIncome.successTitle}
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              {t.addIncome.successBody(formatCurrency(Number(amount)))}
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
