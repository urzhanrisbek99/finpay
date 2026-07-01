"use client";

import { useState } from "react";
import { Header } from "@/src/widgets/header/ui/Header";
import { TransferModal } from "@/src/features/transfer/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/ui/card";
import { formatCurrency, formatDate } from "@/src/shared/lib";
import { transactionModel } from "@/src/entities/transaction";
import { Send, ArrowDownLeft } from "lucide-react";

const recentRecipients = [
  { initials: "AS", name: "Asel", color: "bg-violet-100 text-violet-600" },
  { initials: "DM", name: "Damir", color: "bg-green-100 text-green-600" },
  { initials: "NK", name: "Nurgul", color: "bg-blue-100 text-blue-600" },
  { initials: "ZB", name: "Zarina", color: "bg-pink-100 text-pink-600" },
];

export function Transfers() {
  const [transferOpen, setTransferOpen] = useState(false);
  const transactions = transactionModel
    .useTransactionStore((s) => s.transactions)
    .filter((tx) => tx.type === "transfer");

  return (
    <div className="mx-auto max-w-4xl">
      <Header onNewPayment={() => setTransferOpen(true)} />

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {["By phone", "By QR", "By card"].map((tab, i) => (
                <button
                  key={tab}
                  className={`flex-1 rounded-lg py-2 text-xs transition-colors ${
                    i === 0
                      ? "bg-violet-100 text-violet-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-xs">
                Recent recipients
              </p>
              <div className="flex gap-3">
                {recentRecipients.map((r) => (
                  <div
                    key={r.initials}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${r.color}`}
                    >
                      {r.initials}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {r.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setTransferOpen(true)}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm text-white transition-colors hover:bg-violet-700"
            >
              New transfer
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Transfer history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No transfers yet
              </p>
            ) : (
              <div>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 border-b py-2.5 last:border-0"
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        tx.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowDownLeft size={15} />
                      ) : (
                        <Send size={15} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {tx.merchant}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {tx.type === "income" ? "+" : "−"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </div>
  );
}
