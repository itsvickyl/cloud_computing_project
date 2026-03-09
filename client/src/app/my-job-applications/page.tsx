import Navbar from "@/components/layouts/navbar";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default async function MyJobApplicationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="pt-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage applications received for your job postings
          </p>
        </div>

        <EmptyState
          icon={Users}
          title="No applications received"
          description="When candidates apply to your jobs, you'll see their applications here."
          actionLabel="View My Jobs"
          actionHref="/my-jobs"
        />
      </div>
    </div>
  );
}
