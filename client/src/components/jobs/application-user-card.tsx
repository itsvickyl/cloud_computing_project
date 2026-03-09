"use client";

import { memo } from "react";
import Image from "next/image";
import { Card, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { User } from "@/types";

interface JobCardProps {
  user: User;
  resumeLink: string;
  status: "applied" | "rejected" | "interviewing" | "archieved";
}

const ApplicationUserCard = memo<JobCardProps>(({ resumeLink, status, user }) => {
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

  return (
    <Card className="relative mb-4 border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-5">
          <div className="flex gap-3 md:block">
            {user.profilePic ? (
              <div className="relative">
                <Image
                  src={user.profilePic}
                  alt={user.username ?? ""}
                  width={56}
                  height={56}
                  className="rounded-xl size-14 object-cover ring-1 ring-border/50 group-hover:ring-primary/50 transition-all duration-300"
                />
              </div>
            ) : (
              <div className="size-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center ring-1 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
                <span className="text-xl font-bold text-primary">{user.username?.charAt(0)}</span>
              </div>
            )}

            <div className="md:hidden flex-1">
              <h3 className="font-semibold text-lg leading-tight mb-1.5 group-hover:text-primary transition-colors">
                {user.username}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                <Link href={resumeLink}>Resume</Link>
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="hidden md:block">
              <h3 className="font-semibold text-lg leading-tight mb-1.5 group-hover:text-primary transition-colors">
                {user.username}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                <Link href={resumeLink}>Resume</Link>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Badge
                variant="secondary"
                className={`"rounded-full text-xs font-semibold px-4 py-1.5 ${getStatusColor(status!)}`}
              >
                {status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});

ApplicationUserCard.displayName = "ApplicationUserCard";

export default ApplicationUserCard;
