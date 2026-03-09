"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, User2, Clock } from "lucide-react";
import { Card, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { RelativeTime } from "../ui/relative-time";
import { formatCurrency } from "@/utils/format/currency";
import { jobTypes } from "@/config/constants";
import { getDynamicRoute } from "@/config/routes";
import { Job } from "@/types";

interface JobCardProps {
  job: Job;
  isPublic?: boolean;
}

const JobCard = memo<JobCardProps>(({ job }) => {
  const jobRoute = getDynamicRoute.job(job.id);
  const href = jobRoute;

  if (!job.createdBy) {
    return null;
  }

  return (
    <Link href={href} className="block group">
      <Card className="relative border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-5 md:p-6">
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

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <User2 className="size-4 flex-shrink-0" />
                  <span>{jobTypes.find((type) => type.value === job.type)?.label || job.type}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 flex-shrink-0" />
                  <RelativeTime date={new Date(job.createdAt)} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="font-bold text-xl text-foreground">
                  {formatCurrency(job.minSalary, job.maxSalary)}
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full text-xs font-semibold px-4 py-1.5 bg-primary/10 text-primary border border-primary/20"
                >
                  {jobTypes.find((type) => type.value === job.type)?.label || job.type}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
});

JobCard.displayName = "JobCard";

export default JobCard;
