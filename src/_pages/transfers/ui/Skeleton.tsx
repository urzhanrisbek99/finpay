import { Skeleton as SkeletonBase } from "#shared/ui/skeleton";
import { Card, CardContent, CardHeader } from "#shared/ui/card";

export function Skeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-background rounded-xl border p-4">
            <SkeletonBase className="mb-1 h-4 w-24" />
            <SkeletonBase className="h-6 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <SkeletonBase className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <SkeletonBase key={i} className="h-8 flex-1 rounded-lg" />
              ))}
            </div>

            <div>
              <SkeletonBase className="mb-3 h-3 w-32" />
              <div className="flex flex-wrap gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <SkeletonBase className="h-10 w-10 rounded-full" />
                    <SkeletonBase className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SkeletonBase className="mb-3 h-3 w-36" />
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBase className="h-8 w-8 flex-shrink-0 rounded-full" />
                    <SkeletonBase className="h-4 w-20 flex-1" />
                    <div className="space-y-1.5 text-right">
                      <SkeletonBase className="ml-auto h-4 w-16" />
                      <SkeletonBase className="ml-auto h-3 w-14" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SkeletonBase className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <SkeletonBase className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            {[0, 1, 2, 3, 4].map((i) => (
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
    </div>
  );
}
