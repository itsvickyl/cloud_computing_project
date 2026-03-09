"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { jobTypes, locations } from "@/config/constants";
import { getDynamicRoute } from "@/config/routes";
import { Job } from "@/types";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required").max(200, "Job title is too long"),
  desc: z
    .string()
    .min(10, "Job description must be at least 10 characters")
    .max(5000, "Job description is too long"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Employment type is required"),
  minSalary: z
    .number()
    .min(0, "Minimum salary cannot be negative")
    .max(10000000, "Minimum salary is too high"),
  maxSalary: z
    .number()
    .min(0, "Maximum salary cannot be negative")
    .max(10000000, "Maximum salary is too high"),
  applyBy: z.number().min(1, "Duration must be at least 1 day"),
  // .max(365, "Duration cannot exceed 365 days"),
  // status: z.enum(["DRAFT", "ACTIVE"]),
  resp: z.array(z.string()).optional(),
  req: z.array(z.string()).optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

function getRemainingDays(expirationDate: Date): number {
  // 1. Get the current date
  const currentDate = new Date();

  // 2. Calculate the difference in milliseconds
  // This will be positive if the expirationDate is in the future.
  const diffInMilliseconds = expirationDate.getTime() - currentDate.getTime();

  // 3. Define milliseconds per day
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // 4. Convert milliseconds to days
  // Use Math.ceil() to ensure any remaining time (even just one hour) counts as a full day.
  const remainingDays = Math.ceil(diffInMilliseconds / MS_PER_DAY);

  // 5. Ensure we return 0 if the date has already passed
  return Math.max(0, remainingDays);
}
export function EditJobForm({ job, token }: { job: Job; token: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newResp, setNewResp] = useState("");
  const [newReq, setNewReq] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      ...job,
      applyBy: getRemainingDays(new Date(job.applyBy)),
      resp: job.resp ? job.resp.split("\n") : [],
      req: job.req ? job.req.split("\n") : [],
    },
  });

  const resps = watch("resp") || [];
  const reqs = watch("req") || [];

  const addResp = () => {
    if (newResp.trim() && !resps.includes(newResp.trim())) {
      setValue("resp", [...resps, newResp.trim()]);
      setNewResp("");
    }
  };

  const removeResp = (resp: string) => {
    setValue(
      "resp",
      resps.filter((b) => b !== resp)
    );
  };

  const addReq = () => {
    if (newReq.trim() && !reqs.includes(newReq.trim())) {
      setValue("req", [...reqs, newReq.trim()]);
      setNewReq("");
    }
  };

  const removeReq = (req: string) => {
    setValue(
      "req",
      reqs.filter((b) => b !== req)
    );
  };

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);

    try {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      currentDate.setDate(currentDay + data.applyBy);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          resp: data.resp?.join("\n"),
          req: data.req?.join("\n"),
          applyBy: currentDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.details) {
          const errorMessages = result.details
            .map((issue: { path: string[]; message: string }) => issue.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        throw new Error(result.error || "Failed to update job. Please try again.");
      }

      toast({
        title: "Success!",
        description: result.message || "Job updated successfully.",
      });

      router.push(getDynamicRoute.job(job.id));
    } catch (error) {
      console.error("Error updating job:", error);

      let errorMessage = "Failed to update job. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Link
        href={getDynamicRoute.job(job.id)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              {...register("title")}
              placeholder="e.g. Senior Software Engineer"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <textarea
              id="jobDescription"
              {...register("desc")}
              placeholder="Describe the role, responsibilities, and requirements..."
              className={`min-h-[200px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.desc ? "border-destructive" : "border-input"
              }`}
            />
            {errors.desc && <p className="text-sm text-destructive">{errors.desc.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={watch("location")}
                onValueChange={(value) => setValue("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select value={watch("type")} onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type: { id: number; value: string; label: string }) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Salary Range (USD) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryFrom" className="text-sm text-muted-foreground">
                  Minimum
                </Label>
                <Input
                  id="salaryFrom"
                  type="number"
                  min="0"
                  {...register("minSalary", { valueAsNumber: true })}
                  placeholder="50000"
                  className={errors.minSalary ? "border-destructive" : ""}
                />
                {errors.minSalary && (
                  <p className="text-sm text-destructive">{errors.minSalary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryTo" className="text-sm text-muted-foreground">
                  Maximum
                </Label>
                <Input
                  id="salaryTo"
                  type="number"
                  min="0"
                  {...register("maxSalary", { valueAsNumber: true })}
                  placeholder="80000"
                  className={errors.maxSalary ? "border-destructive" : ""}
                />
                {errors.maxSalary && (
                  <p className="text-sm text-destructive">{errors.maxSalary.message}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the annual salary range for this position. Maximum must be greater than or equal
              to minimum.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listingDuration">Listing Duration (days) *</Label>
            <Input
              id="listingDuration"
              type="number"
              min="1"
              max="365"
              {...register("applyBy", { valueAsNumber: true })}
              placeholder="e.g., 30"
              className={errors.applyBy ? "border-destructive" : ""}
            />
            {errors.applyBy && <p className="text-sm text-destructive">{errors.applyBy.message}</p>}
            <p className="text-xs text-muted-foreground">
              How many days should this job listing remain active? (1-365 days)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a responsibilities"
              value={newResp}
              onChange={(e) => setNewResp(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addResp();
                }
              }}
            />
            <Button type="button" onClick={addResp} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {resps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resps.map((resp) => (
                <Badge key={resp} variant="secondary" className="flex items-center gap-1">
                  {resp}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeResp(resp)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a requirements"
              value={newReq}
              onChange={(e) => setNewReq(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addReq();
                }
              }}
            />
            <Button type="button" onClick={addReq} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {reqs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reqs.map((req) => (
                <Badge key={req} variant="secondary" className="flex items-center gap-1">
                  {req}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeReq(req)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {/* <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValue("status", "DRAFT");
            handleSubmit(onSubmit)();
          }}
          disabled={isSubmitting}
        >
          Save as Draft
        </Button> */}

        <Button
          type="submit"
          // onClick={() => setValue("status", "ACTIVE")}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Updating..." : "Update Job"}
        </Button>
      </div>
    </form>
  );
}
