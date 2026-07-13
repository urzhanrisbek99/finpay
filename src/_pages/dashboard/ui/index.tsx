"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SpendingChart } from "#widgets/spending-chart";
import { TransactionList } from "#widgets/transaction-list";
import { UserBalance } from "#entities/user";
import { QRModal } from "#features/qr-payment";
import { TransferModal } from "#features/transfer";
import { AddIncomeModal } from "#features/add-income";
import { userModel } from "#entities/user";
import { transactionModel, transactionApi } from "#entities/transaction";
import { ROUTES } from "#shared/config";
import { formatCurrency } from "#shared/lib";
import { DashboardSkeleton } from "./DashboardSkeleton";

export function Dashboard() {
  // профиль грузится глобально в оболочке приложения (AppShell) — здесь только
  // читаем из стора
  const user = userModel.useUserStore((s) => s.user);
  const userLoading = userModel.useUserStore((s) => s.isLoading);
  const router = useRouter();
  const statsCards = transactionModel.useDashboardStats();
  const balanceTrend = transactionModel.useBalanceTrend(user?.balance ?? 0);
  const {
    isLoading: txLoading,
    hasLoaded,
    setTransactions,
    setLoading,
  } = transactionModel.useTransactionStore();
  const [qrOpen, setQrOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (hasLoaded) return;

    const load = async () => {
      setLoading(true);
      const { data } = await transactionApi.getAll(user.id);
      if (data) setTransactions(data);
      setLoading(false);
    };

    load();
  }, [user, hasLoaded, setTransactions, setLoading]);

  // скелетон только до первой успешной загрузки; при переходах контент
  // показываем сразу, без повторного скелетона
  const isLoading = userLoading || (txLoading && !hasLoaded);

  return (
    <>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="animate-in fade-in duration-500 ease-out">
          <div className="mb-6 grid grid-cols-4 gap-4">
            <UserBalance balance={user?.balance ?? 0} trend={balanceTrend} />

            {statsCards.map((card) => (
              <div
                key={card.label}
                className="bg-background rounded-xl border p-4"
              >
                <p className="text-muted-foreground mb-1 text-xs">
                  {card.label}
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
                  {card.trend}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <SpendingChart />
            </div>
            <div className="bg-background rounded-xl border p-4">
              <p className="mb-3 text-sm font-medium">Quick actions</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setQrOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-violet-100 px-3 py-2 text-left text-sm text-violet-600 transition-colors hover:bg-violet-200"
                >
                  QR payment
                </button>
                <button
                  onClick={() => setTransferOpen(true)}
                  className="bg-muted hover:bg-muted-foreground/15 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                >
                  Transfer by phone
                </button>
                <button
                  onClick={() => setIncomeOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-left text-sm text-green-700 transition-colors hover:bg-green-200"
                >
                  Add income
                </button>
                <button
                  onClick={() => router.push(ROUTES.ANALYTICS)}
                  className="bg-muted hover:bg-muted-foreground/15 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                >
                  Payment history
                </button>
              </div>
            </div>
          </div>

          <TransactionList />
        </div>
      )}

      {/* Quick actions дашборда: открывают модалки напрямую, локальное состояние */}
      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
      <AddIncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} />
    </>
  );
}
