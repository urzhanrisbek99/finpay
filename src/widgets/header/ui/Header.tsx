"use client";

import { Bell, Plus } from "lucide-react";
import { Button } from "@/src/shared/ui/button";
import { useUserStore } from "@/src/entities/user/model/store";

interface HeaderProps {
  onNewPayment?: () => void;
}

export function Header({ onNewPayment }: HeaderProps) {
  const user = useUserStore((state) => state.user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-muted-foreground">{getGreeting()}</p>
        <h1 className="text-base font-medium">
          {user?.full_name ?? "Loading..."}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={15} />
        </button>
        <Button
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full text-xs px-4 h-8"
          onClick={onNewPayment}
        >
          <Plus size={13} />
          New payment
        </Button>
      </div>
    </div>
  );
}
