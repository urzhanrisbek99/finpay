import { formatCurrency } from "@/src/shared/lib/formatters";

interface UserBalanceProps {
  balance: number;
  trend?: number;
}

export function UserBalance({ balance, trend = 3.2 }: UserBalanceProps) {
  return (
    <div className="rounded-xl bg-violet-600 p-4 text-white">
      <p className="mb-1 text-xs opacity-70">Total balance</p>
      <p className="mb-2 text-2xl font-medium">{formatCurrency(balance)}</p>
      <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
        +{trend}% this month
      </span>
    </div>
  );
}
