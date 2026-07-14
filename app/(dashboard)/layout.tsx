import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "#shared/api/supabase/server";
import { AppSkeleton } from "#app";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Быстрый auth-гейт вне Suspense: редирект отрабатывает до показа скелетона.
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Данные грузятся внутри Suspense — пока идут запросы, стримится AppSkeleton.
  return (
    <Suspense fallback={<AppSkeleton />}>
      <DashboardShell userId={user.id}>{children}</DashboardShell>
    </Suspense>
  );
}
