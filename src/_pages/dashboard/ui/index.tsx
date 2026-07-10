"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "#widgets/header";
import { SpendingChart } from "#widgets/spending-chart";
import { TransactionList } from "#widgets/transaction-list";
import { UserBalance } from "#entities/user";
import { QRModal } from "#features/qr-payment";
import { TransferModal } from "#features/transfer";
import { AddIncomeModal } from "#features/add-income";
import { PaymentMethodModal } from "#features/payment-method";
import { userModel } from "#entities/user";
import { transactionModel, transactionApi } from "#entities/transaction";
import { ROUTES } from "#shared/config";
import { formatCurrency } from "#shared/lib";
import { DashboardSkeleton } from "./DashboardSkeleton";

export function Dashboard() {
  const { user, isLoading: userLoading } = userModel.useUser();
  const router = useRouter();
  const statsCards = transactionModel.useDashboardStats();
  const balanceTrend = transactionModel.useBalanceTrend(user?.balance ?? 0);
  const {
    isLoading: txLoading,
    setTransactions,
    setLoading,
  } = transactionModel.useTransactionStore();
  const [methodOpen, setMethodOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const { data } = await transactionApi.getAll(user.id);
      if (data) setTransactions(data);
      setLoading(false);
    };

    load();
  }, [user, setTransactions, setLoading]);

  const isLoading = userLoading || txLoading;

  return (
    <div className="mx-auto max-w-6xl">
      <Header onNewPayment={() => setMethodOpen(true)} />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
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
        </>
      )}

      <PaymentMethodModal
        open={methodOpen}
        onClose={() => setMethodOpen(false)}
        onSelectQr={() => {
          setMethodOpen(false);
          setQrOpen(true);
        }}
        onSelectTransfer={() => {
          setMethodOpen(false);
          setTransferOpen(true);
        }}
      />

      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
      <AddIncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} />
    </div>
  );
}
