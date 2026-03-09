"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format/currency";
import { formatRelativeTime } from "@/utils/format/relative-time";
import { MapPin, DollarSign, Calendar, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { ROUTES, getDynamicRoute } from "@/config/routes";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@/types";

interface CompanyJobListingsProps {
  token: string;
}

const CompanyJobListings = ({ token }: CompanyJobListingsProps) => {
  const { data } = useQuery({
    queryKey: ["jobs", "created"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data;
    },
  });
  const jobs: Job[] = data || [];

  if (jobs?.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No job listings yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start by posting your first job to find great candidates.
        </p>
        <Button asChild>
          <Link href={ROUTES.POST_JOB}>Post a Job</Link>
        </Button>
      </div>
    );
  }

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "ACTIVE":
  //       return "bg-green-500/10 text-green-500 border-green-500/20";
  //     case "DRAFT":
  //       return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  //     case "EXPIRED":
  //       return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  //     default:
  //       return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  //   }
  // };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {jobs.length} job listing{jobs.length !== 1 ? "s" : ""}
        </p>
        <Button asChild>
          <Link href={ROUTES.POST_JOB}>Post New Job</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(job.minSalary)} - {formatCurrency(job.maxSalary)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatRelativeTime(new Date(job.createdAt))}
                    </div>
                  </div>
                </div>
                {/* <Badge variant="outline" className={getStatusColor(job.status)}>
                  {job.status}
                </Badge> */}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{job.type}</Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{job.desc}</p>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={getDynamicRoute.job(job.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={getDynamicRoute.editJob(job.id)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyJobListings;
