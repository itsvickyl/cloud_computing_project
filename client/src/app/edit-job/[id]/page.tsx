import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

import { EditJobForm } from "@/components/jobs";
import { getAuthToken } from "@/lib/server-only";
import { getJobById } from "@/lib/database/job";
import { Navbar } from "@/components/layouts";

type Params = Promise<{ id: string }>;

export default async function EditJobPage({ params }: { params: Params }) {
  const { id } = await params;
  const authToken = await getAuthToken();

  const job = await getJobById(+id);

  if (!job) {
    return redirect(ROUTES.MY_JOBS);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Job</h1>
            <p className="text-muted-foreground mt-2">Update your job posting details</p>
          </div>

          <EditJobForm job={job} token={authToken} />
        </div>
      </div>
    </div>
  );
}
