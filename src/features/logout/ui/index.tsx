"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserClient } from "@/src/shared/api/supabase/client";
import { userModel } from "@/src/entities/user";
import { transactionModel } from "@/src/entities/transaction";
import { ROUTES } from "@/src/shared/config";

export function LogoutButton() {
  const router = useRouter();
  const setUser = userModel.useUserStore((s) => s.setUser);
  const setTransactions = transactionModel.useTransactionStore(
    (s) => s.setTransactions,
  );

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();

    // очищаем сторы
    setUser(null);
    setTransactions([]);

    router.push(ROUTES.LOGIN);
  };

  return (
    <button
      title="Logout"
      onClick={handleLogout}
      className="text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-red-50 hover:text-red-500"
    >
      <LogOut size={18} />
    </button>
  );
}
