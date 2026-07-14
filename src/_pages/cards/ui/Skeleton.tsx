import { Skeleton as SkeletonBase } from "#shared/ui/skeleton";
import { Card, CardContent, CardHeader } from "#shared/ui/card";

export function Skeleton() {
  return (
    <div className="animate-in fade-in grid grid-cols-2 gap-6 duration-300">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-violet-600 p-5">
          <div className="mb-6 flex items-start justify-between">
            <SkeletonBase className="h-3 w-20 bg-white/25" />
          </div>
          <SkeletonBase className="mb-6 h-5 w-44 bg-white/30" />
          <div className="flex items-end justify-between">
            <div className="space-y-1.5">
              <SkeletonBase className="h-3 w-16 bg-white/20" />
              <SkeletonBase className="h-4 w-24 bg-white/30" />
            </div>
            <div className="space-y-1.5 text-right">
              <SkeletonBase className="ml-auto h-3 w-12 bg-white/20" />
              <SkeletonBase className="ml-auto h-4 w-14 bg-white/30" />
            </div>
            <SkeletonBase className="h-5 w-12 bg-white/25" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <SkeletonBase className="h-5 w-28" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-lg border p-3"
                >
                  <SkeletonBase className="h-[18px] w-[18px] rounded-full" />
                  <SkeletonBase className="h-3 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <SkeletonBase className="h-5 w-28" />
            <SkeletonBase className="h-4 w-10" />
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between">
              <SkeletonBase className="h-3 w-24" />
              <SkeletonBase className="h-3 w-20" />
            </div>
            <SkeletonBase className="h-1.5 w-full rounded-full" />
            <SkeletonBase className="mt-2 h-3 w-40" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <SkeletonBase className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <SkeletonBase className="h-3 w-20" />
                <SkeletonBase className="h-3 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
