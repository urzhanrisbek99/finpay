"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, ArrowLeftRight } from "lucide-react";
import { cn, getInitials } from "#shared/lib";
import { ROUTES } from "#shared/config";
import { useT } from "#shared/i18n";
import { userModel } from "#entities/user";
import { LogoutButton } from "#features/logout";
import { ThemeToggle } from "#features/theme-toggle";
import { SettingsMenu } from "#features/settings";

const navItems = [
  { icon: LayoutDashboard, href: ROUTES.DASHBOARD, key: "dashboard" },
  { icon: CreditCard, href: ROUTES.CARDS, key: "cards" },
  { icon: ArrowLeftRight, href: ROUTES.TRANSFERS, key: "transfers" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const t = useT();
  const user = userModel.useUserStore((state) => state.user);
  const initials = getInitials(user?.full_name ?? "");

  return (
    <aside className="bg-background sticky top-0 flex h-screen w-14 flex-col items-center gap-2 border-r px-2 py-4">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-medium text-white">
        {initials}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ icon: Icon, href, key }) => (
          <Link
            key={href}
            href={href}
            // title рисует тултип, но как доступное имя это ненадёжный фолбэк:
            // у иконочной кнопки имя задаёт aria-label.
            title={t.sidebar[key]}
            aria-label={t.sidebar[key]}
            aria-current={pathname === href ? "page" : undefined}
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
        <SettingsMenu />
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  );
}
