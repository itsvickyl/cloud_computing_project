import SavedJobCard from "@/components/jobs/saved-job-card";
import Navbar from "@/components/layouts/navbar";
import { EmptyState } from "@/components/ui/empty-state";
import { getMySavedJobs } from "@/lib/database/profile";
import { getAuthToken } from "@/lib/server-only";
import { Heart } from "lucide-react";

export default async function FavoritesPage() {
  const authToken = await getAuthToken();
  const savedJobs = await getMySavedJobs(authToken);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="pt-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Saved Jobs</h1>
          <p className="mt-2 text-muted-foreground">Your saved job opportunities</p>
        </div>

        {savedJobs && savedJobs.length > 0 ? (
          <>
            {savedJobs.map((job) => (
              <SavedJobCard key={`${job.userId}-${job.jobId}`} job={job.job} token={authToken} />
            ))}
          </>
        ) : (
          <EmptyState
            icon={Heart}
            title="No saved jobs yet"
            description="Start browsing jobs and save the ones you're interested in."
            actionLabel="Browse Jobs"
            actionHref="/"
          />
        )}
      </div>
    </div>
  );
}
