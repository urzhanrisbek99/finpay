"use client";

import { useState } from "react";
import { CreditCard, Lock, Eye, RefreshCw, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";
import { formatCurrency } from "#shared/lib";
import { useT } from "#shared/i18n";
import { cardModel, cardApi } from "#entities/card";
import { transactionModel } from "#entities/transaction";
import { ShowCVVModal } from "#features/show-cvv";
import { ReissueCardModal } from "#features/reissue-card";
import { RemoveCardModal } from "#features/remove-card";
import { AddCardModal } from "#features/add-card";
import { SetSpendingLimitModal } from "#features/set-spending-limit";

export function Cards() {
  const t = useT();
  const card = cardModel.useCardStore((s) => s.card);
  const toggleFreeze = cardModel.useCardStore((s) => s.toggleFreeze);
  const { spent } = transactionModel.useMonthlySpent();
  const [cvvOpen, setCvvOpen] = useState(false);
  const [reissueOpen, setReissueOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [freezeError, setFreezeError] = useState(false);
  const [freezePending, setFreezePending] = useState(false);

  const limit = card?.spending_limit ?? 0;
  const usedPercent =
    limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const isOverLimit = limit > 0 && spent > limit;

  // Оптимистично, но с откатом: запрос упал — возвращаем флаг обратно, иначе
  // UI показывал бы заморозку, которой нет в БД (а её проверяет сервер).
  // freezePending отсекает второй клик по не доехавшему первому: иначе два
  // запроса ушли бы с одним и тем же card.is_frozen из замыкания.
  const handleToggleFreeze = async () => {
    if (!card || freezePending) return;
    setFreezeError(false);
    setFreezePending(true);
    toggleFreeze();

    const { error } = await cardApi.toggleFreeze(card.id, !card.is_frozen);
    setFreezePending(false);

    if (error) {
      console.error("[cards] freeze toggle failed:", error);
      toggleFreeze();
      setFreezeError(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {card && (
            <div
              className={`rounded-xl p-5 text-white transition-all ${card.is_frozen ? "bg-gray-400" : "bg-violet-600"}`}
            >
              <div className="mb-6 flex items-start justify-between">
                <span className="text-xs opacity-75">{t.cards.bankName}</span>
                {card.is_frozen && (
                  <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
                    {t.cards.frozen}
                  </span>
                )}
              </div>
              <div className="mb-6 text-base tracking-widest">
                •••• •••• •••• {card.number}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="mb-1 text-xs opacity-65">
                    {t.cards.cardHolder}
                  </div>
                  <div className="text-sm font-medium">{card.holder_name}</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-xs opacity-65">
                    {t.cards.expires}
                  </div>
                  <div className="text-sm font-medium">{card.expires_at}</div>
                </div>
                <div className="text-xl opacity-85">
                  {card.type.toUpperCase()}
                </div>
              </div>
            </div>
          )}

          {!card && (
            <button
              onClick={() => setAddOpen(true)}
              className="hover:bg-muted/50 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 transition-colors"
            >
              <CreditCard size={20} className="text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
                {t.cards.addNewCard}
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {t.cards.actions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Все действия требуют карты: без неё кнопки недоступны. */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleFreeze}
                  disabled={!card || freezePending}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                    card?.is_frozen
                      ? "border-violet-200 bg-violet-100 text-violet-600"
                      : "hover:bg-muted"
                  }`}
                >
                  <Lock size={18} />
                  <span className="text-xs">
                    {card?.is_frozen ? t.cards.unfreeze : t.cards.freeze}
                  </span>
                </button>
                <button
                  onClick={() => setCvvOpen(true)}
                  disabled={!card}
                  className="hover:bg-muted flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <Eye size={18} />
                  <span className="text-xs">{t.cards.showCvv}</span>
                </button>
                <button
                  onClick={() => setReissueOpen(true)}
                  disabled={!card}
                  className="hover:bg-muted flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <RefreshCw size={18} />
                  <span className="text-xs">{t.cards.reissue}</span>
                </button>
                <button
                  onClick={() => setRemoveOpen(true)}
                  disabled={!card}
                  className="flex flex-col items-center gap-2 rounded-lg border border-red-100 p-3 text-red-500 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  <span className="text-xs">{t.cards.remove}</span>
                </button>
              </div>

              {freezeError && (
                <p className="mt-3 text-xs text-red-500">
                  {t.cards.freezeError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.cards.spendingLimit}
              </CardTitle>
              {card && (
                <button
                  onClick={() => setLimitOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
                >
                  <Pencil size={12} />
                  {t.cards.edit}
                </button>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between">
                <span className="text-muted-foreground text-xs">
                  {t.cards.usedThisMonth}
                </span>
                <span className="text-xs font-medium">
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${isOverLimit ? "bg-red-500" : "bg-violet-600"}`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <p
                className={`mt-2 text-xs ${isOverLimit ? "text-red-500" : "text-muted-foreground"}`}
              >
                {isOverLimit
                  ? t.cards.limitReached
                  : t.cards.percentUsed(usedPercent)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {t.cards.details}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">
                  {t.cards.cardNumber}
                </span>
                <span className="text-xs">•••• {card?.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">
                  {t.cards.type}
                </span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-600">
                  {t.cards.debit} · {card?.type?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">
                  {t.cards.status}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    card?.is_frozen
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {card?.is_frozen ? t.cards.frozen : t.cards.active}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ShowCVVModal
        open={cvvOpen}
        onClose={() => setCvvOpen(false)}
        cardId={card?.id}
      />
      <ReissueCardModal
        open={reissueOpen}
        onClose={() => setReissueOpen(false)}
      />
      <RemoveCardModal open={removeOpen} onClose={() => setRemoveOpen(false)} />
      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} />
      <SetSpendingLimitModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
      />
    </>
  );
}
