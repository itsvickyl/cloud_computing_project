import Navbar from "@/components/layouts/navbar";
import ResultCard from "@/components/result/result-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getJobResult } from "@/lib/database/result";
import { getAuthToken } from "@/lib/server-only";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function JobResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authToken = await getAuthToken();
  const result = await getJobResult(authToken, +id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="pt-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Rankings for the job</h1>
          <p className="mt-2 text-muted-foreground">
            Our AI is still learning hence it is advised to check once.
          </p>
        </div>

        <Link href={`/job/${id}/applications`} className="underline underline-offset-2">
          Go back
        </Link>

        {result ? (
          <div className="mt-4">
            {result.ranking.map((rank, index) => (
              <ResultCard key={index} rank={rank} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="You haven't ran the ranking on this job."
            description="Go back and run the rank prediction first."
            actionLabel="Go Back"
            actionHref="/my-jobs"
          />
        )}
      </div>
    </div>
  );
}
