import { redirect } from "next/navigation";
import { createServerClient } from "#shared/api/supabase/server";
import { AppShell } from "#app";
import { Sidebar } from "#widgets/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <AppShell>{children}</AppShell>
      </main>
    </div>
  );
}
