import React from "react";
import JobCard from "./job-card";
import { getJobs } from "@/lib/database/job";

interface JobListingServerProps {
  currentPage: number;
  jobTypes: string[];
  timePosted: string;
  isPublic?: boolean;
}

export default async function JobListingServer({
  currentPage,
  jobTypes,
  timePosted,
  isPublic = false,
}: JobListingServerProps) {
  const { jobs } = await getJobs({
    type: jobTypes.length > 0 ? jobTypes : "",
    createdAt: timePosted,
    page: currentPage,
    limit: 10,
  });

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-medium mb-2">No jobs found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} isPublic={isPublic} />
      ))}

      <div className="text-center py-4 text-sm text-muted-foreground">{jobs.length} jobs found</div>
    </div>
  );
}

export { JobCardSkeletonList as JobListingLoading } from "@/components/ui/skeletons";
