"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { getDynamicRoute } from "@/config/routes";
import { Job } from "@/types";
import { Button } from "../ui";
import { useMutation } from "@tanstack/react-query";

interface JobCardProps {
  applicationId: number;
  job: Job;
  status: "applied" | "rejected" | "interviewing" | "archieved";
  token: string;
}

const ApplicationCard = memo<JobCardProps>(({ job, status, token, applicationId }) => {
  const jobRoute = getDynamicRoute.job(job.id);
  const href = jobRoute;

  const { mutateAsync } = useMutation({
    mutationKey: ["applied", "remove", applicationId],
    mutationFn: async () => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applied/${applicationId}`, {
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

  const getStatusColor = (status: "applied" | "rejected" | "interviewing" | "archieved") => {
    switch (status) {
      case "applied":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "interviewing":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "archieved":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (!job.createdBy) {
    return null;
  }

  return (
    <div className="block group">
      <Card className="relative cursor-default border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-5">
            <div className="flex gap-3 md:block">
              {job.createdBy.logo ? (
                <div className="relative">
                  <Image
                    src={job.createdBy.logo}
                    alt={job.createdBy.name}
                    width={56}
                    height={56}
                    className="rounded-xl size-14 object-cover ring-1 ring-border/50 group-hover:ring-primary/50 transition-all duration-300"
                  />
                </div>
              ) : (
                <div className="size-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center ring-1 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
                  <span className="text-xl font-bold text-primary">
                    {job.createdBy.name.charAt(0)}
                  </span>
                </div>
              )}

              <div className="md:hidden flex-1">
                <h3 className="font-semibold text-lg leading-tight mb-1.5 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">{job.createdBy.name}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="hidden md:block">
                <h3 className="font-semibold text-xl leading-tight mb-1.5 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">{job.createdBy.name}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <Badge
                  variant="secondary"
                  className={`"rounded-full text-xs font-semibold px-4 py-1.5 ${getStatusColor(status!)}`}
                >
                  {status}
                </Badge>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={href}>
                    <Button variant={"ghost"} className="cursor-pointer">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    onClick={async () => await mutateAsync()}
                    className="bg-red-500/10 cursor-pointer text-red-500 hover:bg-red-500/30"
                  >
                    Withdraw application
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ApplicationCard.displayName = "ApplicationCard";

export default ApplicationCard;
