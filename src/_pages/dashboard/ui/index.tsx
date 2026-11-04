"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SpendingChart } from "#widgets/spending-chart";
import { BudgetStatus } from "#widgets/budget-status";
import { TransactionList } from "#widgets/transaction-list";
import { UserBalance } from "#entities/user";
import { AddIncomeModal } from "#features/add-income";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { formatCurrency } from "#shared/lib";
import { useT } from "#shared/i18n";

export function Dashboard() {
  const t = useT();
  const user = userModel.useUserStore((s) => s.user);
  const statsCards = transactionModel.useDashboardStats();
  const balanceTrend = transactionModel.useBalanceTrend(user?.balance ?? 0);

  const [incomeOpen, setIncomeOpen] = useState(false);

  return (
    <>
      <div className="animate-in fade-in duration-500 ease-out">
        <div className="mb-6 grid grid-cols-4 gap-4">
          <UserBalance
            balance={user?.balance ?? 0}
            trend={balanceTrend}
            action={
              <button
                onClick={() => setIncomeOpen(true)}
                className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-50"
              >
                <Plus size={12} />
                {t.dashboard.addIncome}
              </button>
            }
          />

          {statsCards.map((card) => (
            <div key={card.key} className="bg-background rounded-xl border p-4">
              <p className="text-muted-foreground mb-1 text-xs">
                {t.dashboard.stats[card.key]}
              </p>
              <p className="mb-2 text-lg font-medium">
                {formatCurrency(card.amount)}
              </p>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  card.positive === true
                    ? "bg-green-100 text-green-700"
                    : card.positive === false
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {card.key === "pending"
                  ? t.dashboard.pendingCount(card.count ?? 0)
                  : card.trend}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <SpendingChart />
          <BudgetStatus />
        </div>

        <TransactionList />
      </div>

      <AddIncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} />
    </>
  );
}
