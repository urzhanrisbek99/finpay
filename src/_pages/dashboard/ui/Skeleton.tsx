import { Skeleton as SkeletonBase } from "#shared/ui/skeleton";
import { Card, CardContent, CardHeader } from "#shared/ui/card";

export function Skeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-violet-600 p-4">
          <SkeletonBase className="mb-1 h-4 w-20 bg-white/25" />
          <SkeletonBase className="mb-2 h-8 w-28 bg-white/30" />
          <SkeletonBase className="h-6 w-24 rounded-full bg-white/20" />
        </div>

        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-background rounded-xl border p-4">
            <SkeletonBase className="mb-1 h-4 w-20" />
            <SkeletonBase className="mb-2 h-7 w-24" />
            <SkeletonBase className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <SkeletonBase className="h-5 w-36" />
              <div className="flex gap-1">
                <SkeletonBase className="h-6 w-14 rounded-full" />
                <SkeletonBase className="h-6 w-14 rounded-full" />
                <SkeletonBase className="h-6 w-14 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonBase className="h-[180px] w-full rounded-lg" />
              <div className="mt-2 flex justify-between border-t pt-3">
                <div className="space-y-1.5">
                  <SkeletonBase className="h-3 w-24" />
                  <SkeletonBase className="h-4 w-20" />
                </div>
                <div className="space-y-1.5 text-right">
                  <SkeletonBase className="ml-auto h-3 w-20" />
                  <SkeletonBase className="ml-auto h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-background rounded-xl border p-4">
          <SkeletonBase className="mb-3 h-4 w-24" />
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBase key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <SkeletonBase className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <SkeletonBase className="mb-4 h-8 w-32" />
            <SkeletonBase className="h-2 w-full rounded-full" />
            <SkeletonBase className="mt-3 h-4 w-28" />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
              <SkeletonBase className="h-8 w-20" />
              <SkeletonBase className="h-8 w-20" />
              <SkeletonBase className="ml-auto h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <SkeletonBase className="h-5 w-40" />
          <div className="flex gap-1">
            <SkeletonBase className="h-6 w-12 rounded-full" />
            <SkeletonBase className="h-6 w-16 rounded-full" />
            <SkeletonBase className="h-6 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b py-2.5 last:border-0"
            >
              <SkeletonBase className="h-8 w-8 flex-shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <SkeletonBase className="h-3.5 w-32" />
                <SkeletonBase className="h-3 w-20" />
              </div>
              <div className="space-y-1.5 text-right">
                <SkeletonBase className="ml-auto h-3.5 w-16" />
                <SkeletonBase className="ml-auto h-4 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
