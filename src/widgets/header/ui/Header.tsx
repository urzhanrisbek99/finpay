"use client";

import { Bell, Plus } from "lucide-react";
import { Button } from "@/src/shared/ui/button";
import { userModel } from "@/src/entities/user";

interface HeaderProps {
  onNewPayment?: () => void;
}

export function Header({ onNewPayment }: HeaderProps) {
  const user = userModel.useUserStore((state) => state.user);

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
        <button className="bg-muted text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors">
          <Bell size={15} />
        </button>
        <Button
          className="h-8 rounded-full bg-violet-600 px-4 text-xs text-white hover:bg-violet-700"
          onClick={onNewPayment}
        >
          <Plus size={13} />
          New payment
        </Button>
      </div>
    </div>
  );
}
