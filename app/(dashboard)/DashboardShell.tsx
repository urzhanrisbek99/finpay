import { createServerClient } from "#shared/api/supabase/server";
import { AppShell, StoreProvider } from "#app";
import { Sidebar } from "#widgets/sidebar";
import { userApi } from "#entities/user";
import { transactionApi } from "#entities/transaction";
import { recipientApi } from "#entities/recipient";
import { cardApi } from "#entities/card";

// Async server component: тянет начальные данные и гидрирует сторы. Стоит под
// <Suspense> в layout, поэтому пока идут запросы — показывается AppSkeleton.
// Запросы делают entity-методы (client-agnostic), сюда передаём серверный клиент.
export async function DashboardShell({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();

  const [profileRes, transactionsRes, recipientsRes, cardRes] =
    await Promise.all([
      userApi.getProfile(userId, supabase),
      transactionApi.getAll(userId, supabase),
      recipientApi.getAll(userId, supabase),
      cardApi.getCard(userId, supabase),
    ]);

  return (
    <StoreProvider
      user={profileRes.data}
      transactions={transactionsRes.data ?? []}
      recipients={recipientsRes.data ?? []}
      card={cardRes.data}
    >
      <div className="bg-muted/30 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <AppShell>{children}</AppShell>
        </main>
      </div>
    </StoreProvider>
  );
}
