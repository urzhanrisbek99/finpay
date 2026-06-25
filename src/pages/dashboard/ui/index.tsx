"use client";

import { useEffect } from "react";
import { Header } from "@/src/widgets/header/ui/Header";
import { SpendingChart } from "@/src/widgets/spending-chart/ui/SpendingChart";
import { TransactionList } from "@/src/widgets/transaction-list/ui/TransactionList";
import { UserBalance } from "@/src/entities/user/ui/UserBalance";
import { userApi } from "@/src/entities/user/api";
import { useUserStore } from "@/src/entities/user/model/store";
import { formatCurrency } from "@/src/shared/lib/formatters";

const statsCards = [
  { label: "Monthly income", amount: 520000, trend: "+8%", positive: true },
  { label: "Monthly expenses", amount: 184300, trend: "−4%", positive: false },
  { label: "Pending", amount: 42000, trend: "3 txns", positive: null },
];

export function Dashboard() {
  const { user, setUser, setLoading } = useUserStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = (
        await import("@/src/shared/api/supabase/client")
      ).createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await userApi.getProfile(authUser.id);
      if (data) setUser(data);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <Header />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <UserBalance balance={user?.balance ?? 0} />

        {statsCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-background border p-4">
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className="text-lg font-medium mb-2">
              {formatCurrency(card.amount)}
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <SpendingChart />
        </div>
        <div className="rounded-xl bg-background border p-4">
          <p className="text-sm font-medium mb-3">Quick actions</p>
          <div className="flex flex-col gap-2">
            {["QR payment", "Transfer by phone", "Payment history"].map(
              (action) => (
                <button
                  key={action}
                  className="flex items-center gap-2 text-sm text-left px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  {action}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <TransactionList />
    </div>
  );
}
