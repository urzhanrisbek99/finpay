"use client";

import { useEffect } from "react";
import { Building2, QrCode, Send, Clock, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/ui/card";

import { formatCurrency, formatDate } from "@/src/shared/lib/formatters";
import { useTransactionStore } from "@/src/entities/transaction/model/store";
import { transactionApi } from "@/src/entities/transaction/api";
import { useUserStore } from "@/src/entities/user/model/store";
import type { Transaction } from "@/src/entities/transaction/model/types";

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

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const icon = categoryIcons[transaction.category] ?? <QrCode size={15} />;
  const iconColor =
    categoryColors[transaction.category] ?? "bg-muted text-muted-foreground";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{transaction.merchant}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.created_at)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">
          {transaction.type === "income" ? "+" : "−"}
          {formatCurrency(transaction.amount)}
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${statusColors[transaction.status]}`}
        >
          {transaction.status}
        </span>
      </div>
    </div>
  );
}

export function TransactionList() {
  const { transactions, isLoading, setTransactions, setLoading } =
    useTransactionStore();
  const user = useUserStore((state) => state.user);

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
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground first:bg-violet-100 first:text-violet-600"
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
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-32" />
                  <div className="h-2 bg-muted rounded animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No transactions yet
          </p>
        ) : (
          transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))
        )}
        {transactions.length > 0 && (
          <button className="w-full text-xs text-violet-600 text-center mt-3">
            View all transactions →
          </button>
        )}
      </CardContent>
    </Card>
  );
}
