"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import { ROUTES } from "@/src/shared/config/routes";

const navItems = [
  { icon: LayoutDashboard, href: ROUTES.DASHBOARD, label: "Dashboard" },
  { icon: CreditCard, href: ROUTES.CARDS, label: "Cards" },
  { icon: ArrowLeftRight, href: ROUTES.TRANSFERS, label: "Transfers" },
  { icon: BarChart3, href: ROUTES.ANALYTICS, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col items-center gap-2 w-14 bg-background border-r px-2 py-4 h-screen sticky top-0">
      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-medium mb-4">
        UR
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, href, label }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              pathname === href && "bg-violet-100 text-violet-600",
            )}
          >
            <Icon size={18} />
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1">
        <button
          title="Settings"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Settings size={18} />
        </button>
        <button
          title="Logout"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
