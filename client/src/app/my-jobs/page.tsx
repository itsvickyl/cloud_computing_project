import Navbar from "@/components/layouts/navbar";
import CompanyJobListings from "@/components/jobs/company-job-listings";
import { getAuthToken } from "@/lib/server-only";

export default async function MyJobsPage() {
  const authToken = await getAuthToken();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="pt-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Job Listings</h1>
          <p className="mt-2 text-muted-foreground">Manage all the jobs you've posted</p>
        </div>

        <CompanyJobListings token={authToken} />
      </div>
    </div>
  );
}
