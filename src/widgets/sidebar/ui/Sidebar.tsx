"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import { ROUTES } from "@/src/shared/config/routes";
import { LogoutButton } from "@/src/features/logout/ui";
import { ThemeToggle } from "@/src/features/theme-toggle/ui";

const navItems = [
  { icon: LayoutDashboard, href: ROUTES.DASHBOARD, label: "Dashboard" },
  { icon: CreditCard, href: ROUTES.CARDS, label: "Cards" },
  { icon: ArrowLeftRight, href: ROUTES.TRANSFERS, label: "Transfers" },
  { icon: BarChart3, href: ROUTES.ANALYTICS, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background sticky top-0 flex h-screen w-14 flex-col items-center gap-2 border-r px-2 py-4">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-medium text-white">
        UR
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ icon: Icon, href, label }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
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
          className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        >
          <Settings size={18} />
        </button>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  );
}
