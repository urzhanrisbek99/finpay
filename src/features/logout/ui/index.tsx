"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserClient } from "#shared/api";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { ROUTES } from "#shared/config";
import { useT } from "#shared/i18n";

export function LogoutButton() {
  const router = useRouter();
  const t = useT();
  const setUser = userModel.useUserStore((s) => s.setUser);
  const resetTransactions = transactionModel.useTransactionStore(
    (s) => s.reset,
  );

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();

    setUser(null);
    resetTransactions();

    router.push(ROUTES.LOGIN);
  };

  return (
    <button
      title={t.sidebar.logout}
      onClick={handleLogout}
      className="text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-red-50 hover:text-red-500"
    >
      <LogOut size={18} />
    </button>
  );
}
