import { redirect } from "next/navigation";
import { createClient } from "@/src/shared/api/supabase/server";
import { Sidebar } from "@/src/widgets/sidebar/ui/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
