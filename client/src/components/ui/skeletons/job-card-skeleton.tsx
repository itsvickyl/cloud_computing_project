import { Card, CardHeader } from "../card";
import { Skeleton } from "../skeleton";

export function JobCardSkeleton() {
  return (
    <Card className="relative border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-5">
          {/* Company Logo Skeleton */}
          <div className="flex gap-3 md:block">
            <Skeleton className="size-14 rounded-xl" />

            {/* Mobile: Job info skeleton next to logo */}
            <div className="md:hidden flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Desktop: Job Info Skeleton */}
          <div className="flex-1 space-y-3">
            {/* Desktop: Job Title & Company */}
            <div className="hidden md:block space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Salary & Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export function JobCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}
