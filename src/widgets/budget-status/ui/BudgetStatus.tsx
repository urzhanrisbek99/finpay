"use client";

import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";
import { formatCurrency } from "#shared/lib";
import { useT } from "#shared/i18n";
import { transactionModel } from "#entities/transaction";
import { cardModel } from "#entities/card";

type BudgetLevel = "on-track" | "trending-over" | "over-budget" | "no-budget";

// Цвета уровня бюджета; подпись уровня берётся из словаря по ключу level.
const BUDGET_META: Record<BudgetLevel, { text: string; bar: string }> = {
  "on-track": { text: "text-green-600", bar: "bg-green-500" },
  "trending-over": { text: "text-amber-600", bar: "bg-amber-500" },
  "over-budget": { text: "text-red-600", bar: "bg-red-500" },
  "no-budget": { text: "text-muted-foreground", bar: "bg-muted-foreground/40" },
};

function getBudget(spent: number, limit: number) {
  const now = new Date();
  const day = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const pace = day / daysInMonth;
  const projected = pace > 0 ? Math.round(spent / pace) : spent;
  const dailyAvg = Math.round(spent / day);

  let level: BudgetLevel;
  if (limit <= 0) level = "no-budget";
  else if (spent > limit) level = "over-budget";
  else if (projected > limit) level = "trending-over";
  else level = "on-track";

  const usedPercent =
    limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const pacePercent = Math.min(100, Math.round(pace * 100));

  return { level, projected, dailyAvg, usedPercent, pacePercent };
}

export function BudgetStatus() {
  const t = useT();
  const card = cardModel.useCardStore((s) => s.card);
  const { spent } = transactionModel.useMonthlySpent();

  const limit = card?.spending_limit ?? 0;
  const { level, projected, dailyAvg, usedPercent, pacePercent } = getBudget(
    spent,
    limit,
  );
  const meta = BUDGET_META[level];
  const isOver = level === "over-budget";
  const remaining = Math.max(0, limit - spent);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {t.budget.monthly}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold">{formatCurrency(spent)}</p>
            <p className="text-muted-foreground text-xs">
              {limit > 0
                ? t.budget.ofLimit(formatCurrency(limit))
                : t.budget.noLimit}
            </p>
          </div>
          {limit > 0 && (
            <p className={`text-sm font-medium ${meta.text}`}>
              {isOver
                ? t.budget.over(formatCurrency(spent - limit))
                : t.budget.left(formatCurrency(remaining))}
            </p>
          )}
        </div>

        <div className="bg-muted relative h-2 rounded-full">
          <div
            className={`${meta.bar} h-full rounded-full transition-all`}
            style={{ width: `${usedPercent}%` }}
          />
          {limit > 0 && (
            <div
              className="bg-foreground/40 absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded"
              style={{ left: `${pacePercent}%` }}
              title={t.budget.expectedPace}
            />
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${meta.bar}`} />
          <span className={`text-sm font-medium ${meta.text}`}>
            {t.budget.levels[level]}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3 text-xs">
          <div>
            <p className="text-muted-foreground">{t.budget.projected}</p>
            <p className="font-medium">
              {limit > 0 ? formatCurrency(projected) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.budget.dailyAvg}</p>
            <p className="font-medium">{formatCurrency(dailyAvg)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">
              {isOver ? t.budget.overBy : t.budget.remaining}
            </p>
            <p className={`font-medium ${isOver ? meta.text : ""}`}>
              {limit > 0
                ? formatCurrency(isOver ? spent - limit : remaining)
                : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
