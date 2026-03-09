import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

const JobCardSkeleton = () => (
  <div className="border border-border/50 rounded-lg p-5 md:p-6 bg-card/50 backdrop-blur-sm">
    <div className="flex flex-col md:flex-row gap-4 md:gap-5">
      <div className="flex gap-3 md:block">
        <Skeleton className="size-14 rounded-xl" />

        <div className="md:hidden flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="hidden md:block space-y-2">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const JobListingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-32 w-full" />
    </div>
    <Skeleton className="h-10 w-32" />
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="w-full">
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const ProfileCardSkeleton = () => (
  <div className="border rounded-lg p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="size-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const SearchBarSkeleton = () => (
  <div className="flex gap-2">
    <Skeleton className="h-10 flex-1" />
    <Skeleton className="h-10 w-24" />
  </div>
);

const StatsCardSkeleton = () => (
  <div className="border rounded-lg p-6 space-y-2">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-8 w-16" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TableSkeleton />
      </div>
      <div>
        <ProfileCardSkeleton />
      </div>
    </div>
  </div>
);

export {
  Skeleton,
  JobCardSkeleton,
  JobListingSkeleton,
  FormSkeleton,
  TableSkeleton,
  ProfileCardSkeleton,
  SearchBarSkeleton,
  StatsCardSkeleton,
  DashboardSkeleton,
};
