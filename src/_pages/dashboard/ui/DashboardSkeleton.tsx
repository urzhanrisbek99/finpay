import { Skeleton } from "#shared/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <>
      <div className="mb-6 grid grid-cols-4 gap-4">
        {/* карточка баланса */}
        <div className="rounded-xl bg-violet-600 p-4">
          <Skeleton className="mb-2 h-3 w-20 bg-white/25" />
          <Skeleton className="mb-3 h-7 w-28 bg-white/30" />
          <Skeleton className="h-5 w-24 rounded-full bg-white/20" />
        </div>

        {/* stat-карточки */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-background rounded-xl border p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="mb-3 h-5 w-24" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* график расходов */}
        <div className="bg-background col-span-2 rounded-xl border p-4">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-[180px] w-full" />
        </div>

        {/* быстрые действия */}
        <div className="bg-background rounded-xl border p-4">
          <Skeleton className="mb-3 h-4 w-24" />
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* список транзакций */}
      <div className="bg-background rounded-xl border p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-20" />
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="ml-auto h-3 w-16" />
                <Skeleton className="ml-auto h-4 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
