import Navbar from "@/components/layouts/navbar";
import { JobPostingForm } from "@/components/jobs";
import { getAuthToken } from "@/lib/server-only";

export default async function PostJobPage() {
  const authToken = await getAuthToken();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="pt-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a Job</h1>
          <p className="mt-2 text-muted-foreground">
            Create a new job listing to find the perfect candidates
          </p>
        </div>

        <JobPostingForm token={authToken} />
      </div>
    </div>
  );
}
