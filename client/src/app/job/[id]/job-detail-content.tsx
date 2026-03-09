"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Heart,
  HeartCrackIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/utils/format/currency";
import { jobTypes } from "@/config/constants";
import { getFlagEmoji } from "@/utils/countries";
import { FormattedDate } from "@/components/ui/formatted-date";
import { useMutation } from "@tanstack/react-query";
import { Job, User } from "@/types";
import { redirect, useRouter } from "next/navigation";

interface JobDetailContentProps {
  job: Job | undefined;
  token: string;
  user: User | null;
  hasApplied: number | null;
  hasSaved: number | null;
}

export function JobDetailContent({
  job,
  token,
  user,
  hasApplied,
  hasSaved,
}: JobDetailContentProps) {
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["applied"],
    mutationFn: async (data: { jobId: number }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applied`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const d = await res.json();
      return d;
    },
    onSuccess: () => {
      redirect("/my-applications");
    },
  });

  const { mutateAsync: removeJob } = useMutation({
    mutationKey: ["job", "remove", job?.id],
    mutationFn: async (jobId: number) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess() {
      redirect("/");
    },
  });

  const { mutateAsync: withdrawApplication, isPending: isWithdrawPending } = useMutation({
    mutationKey: ["applied", "remove", hasApplied],
    mutationFn: async (id: number) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applied/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      window.location.reload();
    },
  });

  const { mutateAsync: saveJob } = useMutation({
    mutationKey: ["saved"],
    mutationFn: async (data: { jobId: number }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/saved`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const d = await res.json();
      return d;
    },
    onSuccess: () => {
      redirect("/favorites");
    },
  });

  const { mutateAsync: removeSavedJob } = useMutation({
    mutationKey: ["saved", "remove", job?.id],
    mutationFn: async (jobId: number) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/saved/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess() {
      router.refresh();
    },
  });

  if (job) {
    const locationFlag = getFlagEmoji(job.location);

    return (
      <div className="py-8 pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-8 col-1 md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <div className="flex items-center gap-2 mt-3">
                  <p className="font-medium">{job.createdBy?.name}</p>
                  <Badge className="rounded-full" variant="secondary">
                    {jobTypes.find((jobType) => jobType.value === job.type)?.label || job.type}
                  </Badge>
                  <Badge className="rounded-full text-white" variant="outline">
                    {locationFlag && <span className="mr-1">{locationFlag}</span>}
                    {job.location}
                  </Badge>
                </div>
              </div>

              {token && user && user.type === "user" && (
                <>
                  {token ? (
                    <>
                      {" "}
                      {hasSaved ? (
                        <Button
                          className="shadow-none bg-red-500/10 text-red-500 hover:bg-red-500/30"
                          onClick={async () => removeSavedJob(job.id)}
                        >
                          <HeartCrackIcon className="size-4" />
                          Remove from Saved
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="shadow-none"
                          onClick={async () => saveJob({ jobId: job.id })}
                        >
                          <Heart className="size-4" />
                          Save Job
                        </Button>
                      )}
                    </>
                  ) : (
                    <Link href={`/login?redirect=/job/${job.id}`}>
                      <Button variant="outline" className="shadow-none">
                        <Heart className="size-4" />
                        Save Job
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Job Description</h2>
              <div className="prose max-w-none">
                {job.desc}

                <h3 className="text-lg font-semibold mt-4 mb-2">Responsibilites:</h3>
                <ul className="list-disc pl-8">
                  {job.resp.split("\n").map((resp: string, index: number) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold mt-4 mb-2">Requirements:</h3>
                <ul className="list-disc pl-8">
                  {job.req.split("\n").map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {user && user.type === "org" && (
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Manage this job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/edit-job/${job.id}`} className="w-full">
                    <Button className="w-full" variant="outline">
                      Edit Job
                    </Button>
                  </Link>
                  <Link href={`/job/${job.id}/applications`} className="w-full">
                    <Button className="w-full my-2" variant="outline">
                      View Applications
                    </Button>
                  </Link>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={async () => {
                      await removeJob(job.id);
                    }}
                  >
                    Remove Job
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(job.minSalary, job.maxSalary)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Posted <FormattedDate date={new Date(job.createdAt)} />
                    </span>
                  </div>
                </div>

                {token && user && user.type === "user" && (
                  <>
                    {hasApplied ? (
                      <Button
                        onClick={async () => {
                          await withdrawApplication(hasApplied);
                        }}
                        disabled={isWithdrawPending}
                        className="bg-red-500/10 cursor-pointer text-red-500 hover:bg-red-500/30"
                      >
                        {isWithdrawPending ? "Withdrawing..." : "Withdraw application"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={isPending}
                        onClick={async () => {
                          await mutateAsync({
                            jobId: job.id,
                          });
                        }}
                      >
                        {isPending ? "Applying..." : "Apply Now"}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                {job.createdBy && (
                  <div className="flex items-start gap-4">
                    {job.createdBy?.logo ? (
                      <Image
                        src={job.createdBy?.logo || ""}
                        alt={`${job.createdBy?.name} logo`}
                        width={48}
                        height={48}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="size-12 bg-muted rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="font-semibold">{job.createdBy?.name}</h3>
                      <p className="text-sm text-muted-foreground">{job.createdBy?.desc}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.createdBy?.address}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Job Not Found</h1>
        <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist.</p>
        <Link href="/" className="mt-4 inline-block">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    </div>
  );
}
