"use client";

import { Plus } from "lucide-react";
import { Button } from "#shared/ui/button";
import { userModel } from "#entities/user";
import { usePaymentMethodStore } from "#features/payment-method";

export function Header() {
  const user = userModel.useUserStore((state) => state.user);
  const openNewPayment = usePaymentMethodStore((state) => state.open);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-muted-foreground text-xs">{getGreeting()}</p>
        <h1 className="text-base font-medium">
          {user?.full_name ?? "Loading..."}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          className="h-8 rounded-full bg-violet-600 px-4 text-xs text-white hover:bg-violet-700"
          onClick={openNewPayment}
        >
          <Plus size={13} />
          New payment
        </Button>
      </div>
    </div>
  );
}
