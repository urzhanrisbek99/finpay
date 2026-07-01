"use client";

import { useState } from "react";
import { Header } from "@/src/widgets/header/ui/Header";
import { SpendingChart } from "@/src/widgets/spending-chart/ui/SpendingChart";
import { TransactionList } from "@/src/widgets/transaction-list/ui/TransactionList";
import { UserBalance } from "@/src/entities/user";
import { QRModal } from "@/src/features/qr-payment/ui";
import { TransferModal } from "@/src/features/transfer/ui";
import { userModel } from "@/src/entities/user";
import { formatCurrency } from "@/src/shared/lib";

const statsCards = [
  { label: "Monthly income", amount: 520000, trend: "+8%", positive: true },
  { label: "Monthly expenses", amount: 184300, trend: "−4%", positive: false },
  { label: "Pending", amount: 42000, trend: "3 txns", positive: null },
];

export function Dashboard() {
  const { user } = userModel.useUser();
  const [qrOpen, setQrOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <Header onNewPayment={() => setQrOpen(true)} />

      <div className="mb-6 grid grid-cols-4 gap-4">
        <UserBalance balance={user?.balance ?? 0} />

        {statsCards.map((card) => (
          <div key={card.label} className="bg-background rounded-xl border p-4">
            <p className="text-muted-foreground mb-1 text-xs">{card.label}</p>
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
              className="bg-muted hover:bg-muted/80 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
            >
              Transfer by phone
            </button>
            <button className="bg-muted hover:bg-muted/80 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors">
              Payment history
            </button>
          </div>
        </div>
      </div>

      <TransactionList />

      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </div>
  );
}
