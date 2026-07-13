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
import { cn } from "#shared/lib";
import { ROUTES } from "#shared/config";
import { userModel } from "#entities/user";
import { LogoutButton } from "#features/logout";
import { ThemeToggle } from "#features/theme-toggle";

function getInitials(fullName?: string) {
  if (!fullName) return "";
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const navItems = [
  { icon: LayoutDashboard, href: ROUTES.DASHBOARD, label: "Dashboard" },
  { icon: CreditCard, href: ROUTES.CARDS, label: "Cards" },
  { icon: ArrowLeftRight, href: ROUTES.TRANSFERS, label: "Transfers" },
  { icon: BarChart3, href: ROUTES.ANALYTICS, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = userModel.useUserStore((state) => state.user);
  const initials = getInitials(user?.full_name);

  return (
    <aside className="bg-background sticky top-0 flex h-screen w-14 flex-col items-center gap-2 border-r px-2 py-4">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-medium text-white">
        {initials}
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
