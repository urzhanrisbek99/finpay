"use client";

import { formatCurrency } from "#shared/lib";
import { useT } from "#shared/i18n";

interface UserBalanceProps {
  balance: number;
  trend?: number;
}

export function UserBalance({ balance, trend = 0 }: UserBalanceProps) {
  const t = useT();
  const sign = trend >= 0 ? "+" : "−";

  return (
    <div className="rounded-xl bg-violet-600 p-4 text-white">
      <p className="mb-1 text-xs opacity-70">{t.balance.total}</p>
      <p className="mb-2 text-2xl font-medium">{formatCurrency(balance)}</p>
      <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
        {t.balance.trend(sign, Math.abs(trend))}
      </span>
    </div>
  );
}
