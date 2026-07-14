"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Skeleton as S } from "#shared/ui/skeleton";
import { Card, CardContent, CardHeader } from "#shared/ui/card";

// Suspense-фолбэк для (dashboard): показывается, пока layout тянет начальные
// данные из Supabase. Через useSelectedLayoutSegment понимает, какой маршрут
// грузится, и рисует скелетон именно этой страницы — поэтому на /cards виден
// скелетон карт, а не дашборда.
export function AppSkeleton() {
  const segment = useSelectedLayoutSegment();

  const Content =
    segment === "cards"
      ? CardsContent
      : segment === "transfers"
        ? TransfersContent
        : DashboardContent;

  // Ширина контента совпадает с AppShell (dashboard — max-w-6xl, остальное — 4xl).
  const maxWidth =
    segment === "cards" || segment === "transfers" ? "max-w-4xl" : "max-w-6xl";

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <aside className="bg-background sticky top-0 flex h-screen w-14 flex-col items-center gap-2 border-r px-2 py-4">
        <S className="mb-4 h-8 w-8 rounded-full" />
        <div className="flex flex-1 flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <S key={i} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <S key={i} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <div className={`mx-auto ${maxWidth}`}>
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <S className="h-3 w-24" />
              <S className="h-5 w-40" />
            </div>
            <S className="h-8 w-32 rounded-full" />
          </div>

          <Content />
        </div>
      </main>
    </div>
  );
}

function DashboardContent() {
  return (
    <>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-violet-600 p-4">
          <S className="mb-1 h-4 w-20 bg-white/25" />
          <S className="mb-2 h-8 w-28 bg-white/30" />
          <S className="h-6 w-24 rounded-full bg-white/20" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-background rounded-xl border p-4">
            <S className="mb-1 h-4 w-20" />
            <S className="mb-2 h-7 w-24" />
            <S className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <S className="h-5 w-36" />
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <S key={i} className="h-6 w-14 rounded-full" />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <S className="h-[180px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        <div className="bg-background rounded-xl border p-4">
          <S className="mb-3 h-4 w-24" />
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <S key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <S className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b py-2.5 last:border-0"
            >
              <S className="h-8 w-8 flex-shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <S className="h-3.5 w-32" />
                <S className="h-3 w-20" />
              </div>
              <div className="space-y-1.5 text-right">
                <S className="ml-auto h-3.5 w-16" />
                <S className="ml-auto h-4 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function TransfersContent() {
  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-background rounded-xl border p-4">
            <S className="mb-1 h-4 w-24" />
            <S className="h-6 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <S className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <S key={i} className="h-8 flex-1 rounded-lg" />
              ))}
            </div>
            <div>
              <S className="mb-3 h-3 w-32" />
              <div className="flex flex-wrap gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <S className="h-10 w-10 rounded-full" />
                    <S className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>
            <S className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <S className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b py-2.5 last:border-0"
              >
                <S className="h-8 w-8 flex-shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <S className="h-3.5 w-32" />
                  <S className="h-3 w-20" />
                </div>
                <div className="space-y-1.5 text-right">
                  <S className="ml-auto h-3.5 w-16" />
                  <S className="ml-auto h-4 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CardsContent() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-violet-600 p-5">
          <div className="mb-6 flex items-start justify-between">
            <S className="h-3 w-20 bg-white/25" />
          </div>
          <S className="mb-6 h-5 w-44 bg-white/30" />
          <div className="flex items-end justify-between">
            <div className="space-y-1.5">
              <S className="h-3 w-16 bg-white/20" />
              <S className="h-4 w-24 bg-white/30" />
            </div>
            <div className="space-y-1.5 text-right">
              <S className="ml-auto h-3 w-12 bg-white/20" />
              <S className="ml-auto h-4 w-14 bg-white/30" />
            </div>
            <S className="h-5 w-12 bg-white/25" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <S className="h-5 w-28" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-lg border p-3"
                >
                  <S className="h-[18px] w-[18px] rounded-full" />
                  <S className="h-3 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <S className="h-5 w-28" />
            <S className="h-4 w-10" />
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between">
              <S className="h-3 w-24" />
              <S className="h-3 w-20" />
            </div>
            <S className="h-1.5 w-full rounded-full" />
            <S className="mt-2 h-3 w-40" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <S className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <S className="h-3 w-20" />
                <S className="h-3 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
