"use client";

import { CreditCard, Lock, Eye, RefreshCw, Trash2 } from "lucide-react";
import { Header } from "@/src/widgets/header/ui/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/ui/card";
import { formatCurrency } from "@/src/shared/lib/formatters";
import { useCard } from "@/src/entities/card/model/useCard";
import { cardApi } from "@/src/entities/card/api";
import { useCardStore } from "@/src/entities/card/model/store";
import { Skeleton } from "@/src/shared/ui/skeleton";

export function Cards() {
  const { card, isLoading } = useCard();
  const { toggleFreeze } = useCardStore();

  const handleToggleFreeze = async () => {
    if (!card) return;
    toggleFreeze();
    await cardApi.toggleFreeze(card.id, !card.is_frozen);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Header />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Header />

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div
            className={`rounded-xl p-5 text-white transition-all ${card?.is_frozen ? "bg-gray-400" : "bg-violet-600"}`}
          >
            <div className="mb-6 flex items-start justify-between">
              <span className="text-xs opacity-75">Halyk Bank</span>
              {card?.is_frozen && (
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
                  Frozen
                </span>
              )}
            </div>
            <div className="mb-6 text-base tracking-widest">
              •••• •••• •••• {card?.number ?? "0000"}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-1 text-xs opacity-65">Card holder</div>
                <div className="text-sm font-medium">{card?.holder_name}</div>
              </div>
              <div className="text-right">
                <div className="mb-1 text-xs opacity-65">Expires</div>
                <div className="text-sm font-medium">{card?.expires_at}</div>
              </div>
              <div className="text-xl opacity-85">VISA</div>
            </div>
          </div>

          <div className="hover:bg-muted/50 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 transition-colors">
            <CreditCard size={20} className="text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Add new card</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Card actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleFreeze}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                    card?.is_frozen
                      ? "border-violet-200 bg-violet-100 text-violet-600"
                      : "hover:bg-muted"
                  }`}
                >
                  <Lock size={18} />
                  <span className="text-xs">
                    {card?.is_frozen ? "Unfreeze" : "Freeze"}
                  </span>
                </button>
                <button className="hover:bg-muted flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors">
                  <Eye size={18} />
                  <span className="text-xs">Show CVV</span>
                </button>
                <button className="hover:bg-muted flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors">
                  <RefreshCw size={18} />
                  <span className="text-xs">Reissue</span>
                </button>
                <button className="flex flex-col items-center gap-2 rounded-lg border border-red-100 p-3 text-red-500 transition-colors hover:bg-red-50">
                  <Trash2 size={18} />
                  <span className="text-xs">Remove</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Spending limit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between">
                <span className="text-muted-foreground text-xs">
                  Used this month
                </span>
                <span className="text-xs font-medium">
                  {formatCurrency(card?.spent ?? 0)} /{" "}
                  {formatCurrency(card?.spending_limit ?? 0)}
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-violet-600"
                  style={{
                    width: `${card ? (card.spent / card.spending_limit) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {card
                  ? Math.round((card.spent / card.spending_limit) * 100)
                  : 0}
                % of monthly limit used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Card details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">
                  Card number
                </span>
                <span className="text-xs">•••• {card?.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Type</span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-600">
                  Debit · {card?.type?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Status</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    card?.is_frozen
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {card?.is_frozen ? "Frozen" : "Active"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
