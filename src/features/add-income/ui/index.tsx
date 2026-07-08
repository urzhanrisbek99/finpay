"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "#shared/ui/dialog";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { formatCurrency } from "#shared/lib";
import type { TransactionCategory } from "#shared/types";
import { useAddIncome } from "../model";

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000];

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "other", label: "Other" },
];

interface AddIncomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddIncomeModal({ open, onClose }: AddIncomeModalProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("salary");
  const { state, error, add, reset } = useAddIncome();

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
              <h2 className="text-base font-medium">Add income</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Record money coming in — it updates your balance and stats
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Amount (₸)</Label>
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
              <Label>Source</Label>
              <Input
                placeholder="Employer, client, refund..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      category === c.value
                        ? "bg-violet-100 text-violet-600"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
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
              Add {amount ? formatCurrency(Number(amount)) : "income"}
            </Button>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={32} className="animate-spin text-violet-600" />
            <p className="text-muted-foreground text-sm">Adding income...</p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={48} className="text-green-500" />
            <h2 className="text-base font-medium">Income added!</h2>
            <p className="text-muted-foreground text-center text-sm">
              {formatCurrency(Number(amount))} added to your balance
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
