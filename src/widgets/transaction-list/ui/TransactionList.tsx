"use client";

import { useEffect } from "react";
import { Building2, QrCode, Send, Clock, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

import { formatCurrency, formatDate } from "#shared/lib";
import { transactionModel } from "#entities/transaction";
import { transactionApi } from "#entities/transaction";
import { userModel } from "#entities/user";

const categoryIcons: Record<string, React.ReactNode> = {
  salary: <Building2 size={15} />,
  transfer: <Send size={15} />,
  shopping: <ShoppingBag size={15} />,
  subscription: <Clock size={15} />,
  other: <QrCode size={15} />,
};

const categoryColors: Record<string, string> = {
  salary: "bg-violet-100 text-violet-600",
  transfer: "bg-blue-100 text-blue-600",
  shopping: "bg-pink-100 text-pink-600",
  subscription: "bg-amber-100 text-amber-700",
  other: "bg-green-100 text-green-600",
};

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

function TransactionRow({
  transaction,
}: {
  transaction: transactionModel.Transaction;
}) {
  const icon = categoryIcons[transaction.category] ?? <QrCode size={15} />;
  const iconColor =
    categoryColors[transaction.category] ?? "bg-muted text-muted-foreground";

  return (
    <div className="flex items-center gap-3 border-b py-2.5 last:border-0">
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconColor}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{transaction.merchant}</p>
        <p className="text-muted-foreground text-xs">
          {formatDate(transaction.created_at)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">
          {transaction.type === "income" ? "+" : "−"}
          {formatCurrency(transaction.amount)}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${statusColors[transaction.status]}`}
        >
          {transaction.status}
        </span>
      </div>
    </div>
  );
}

export function TransactionList() {
  const { transactions, isLoading, setTransactions, setLoading } =
    transactionModel.useTransactionStore();
  const user = userModel.useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const { data } = await transactionApi.getAll(user.id);
      if (data) setTransactions(data);
      setLoading(false);
    };

    load();
  }, [user]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Recent transactions
        </CardTitle>
        <div className="flex gap-1">
          {["All", "Income", "Expense"].map((filter) => (
            <button
              key={filter}
              className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs first:bg-violet-100 first:text-violet-600"
            >
              {filter}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="bg-muted h-3 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-2 w-20 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No transactions yet
          </p>
        ) : (
          transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))
        )}
        {transactions.length > 0 && (
          <button className="mt-3 w-full text-center text-xs text-violet-600">
            View all transactions →
          </button>
        )}
      </CardContent>
    </Card>
  );
}
