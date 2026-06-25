import { formatCurrency } from "@/src/shared/lib/formatters";

interface UserBalanceProps {
  balance: number;
  trend?: number;
}

export function UserBalance({ balance, trend = 3.2 }: UserBalanceProps) {
  return (
    <div className="rounded-xl bg-violet-600 text-white p-4">
      <p className="text-xs opacity-70 mb-1">Total balance</p>
      <p className="text-2xl font-medium mb-2">{formatCurrency(balance)}</p>
      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
        +{trend}% this month
      </span>
    </div>
  );
}
