import { PredictButton } from "@/components/admin/predict-button";
import ApplicationUserCard from "@/components/jobs/application-user-card";
import Navbar from "@/components/layouts/navbar";
import { EmptyState } from "@/components/ui/empty-state";
import { getJobApplications } from "@/lib/database/profile";
import { checkResult } from "@/lib/database/result";
import { getAuthToken } from "@/lib/server-only";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authToken = await getAuthToken();
  const applications = await getJobApplications(authToken, +id);
  const hasResult = await checkResult(authToken, +id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="pt-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Applications for the job</h1>
          <p className="mt-2 text-muted-foreground">{applications?.length} applicants</p>
        </div>

        {hasResult ? (
          <Link
            href={`/job/${id}/result`}
            className="underline underline-offset-2 text-lg font-semibold"
          >
            See Result
          </Link>
        ) : (
          <PredictButton
            id={+id}
            token={authToken}
            applicants={applications?.length || 0}
            disabled={applications && applications.length <= 0}
          />
        )}

        {applications && applications.length > 0 ? (
          <>
            <div className="mt-4">
              {applications.map((application) => (
                <ApplicationUserCard
                  key={application.id}
                  resumeLink={application.usedResume}
                  user={application.userId}
                  status={application.status}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={FileText}
            title="No applicants yet"
            description="You will see the list after someone applys for the job."
            actionLabel="Browse your other Jobs"
            actionHref="/my-jobs"
          />
        )}
      </div>
    </div>
  );
}
