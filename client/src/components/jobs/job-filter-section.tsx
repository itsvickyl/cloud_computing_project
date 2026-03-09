"use client";
import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { XIcon, SlidersHorizontalIcon } from "lucide-react";
import { Label } from "../ui/label";
import { jobTypes, timeFilterOptions } from "@/config/constants";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const JobFilterSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Get current filters from the URL
  const currentJobTypes = searchParams.get("jobTypes")?.split(",") || [];
  const currentTimePosted = searchParams.get("timePosted") || "all";

  // Count active filters
  const activeFiltersCount = currentJobTypes.length + (currentTimePosted !== "all" ? 1 : 0);

  function clearAllFilter() {
    const params = new URLSearchParams();
    router.push(`/?${params.toString()}`);
    setIsSheetOpen(false);
  }

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      return params.toString();
    },
    [searchParams]
  );

  function handleJobTypeChange(jobType: string, checked: boolean) {
    let updatedJobTypes = [...currentJobTypes];

    if (checked) {
      if (!updatedJobTypes.includes(jobType)) {
        updatedJobTypes.push(jobType);
      }
    } else {
      updatedJobTypes = updatedJobTypes.filter((type) => type !== jobType);
    }

    const queryString = createQueryString(
      "jobTypes",
      updatedJobTypes.join(",")
    );
    router.push(`/?${queryString}`);
  }

  function handleTimePostedChange(timePosted: string) {
    const queryString = createQueryString("timePosted", timePosted);
    router.push(`/?${queryString}`);
  }

  const FilterContent = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-bold tracking-tight">Time Posted</Label>
        <Select value={currentTimePosted} onValueChange={handleTimePostedChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {timeFilterOptions.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-bold tracking-tight">Job Type</Label>
        <div className="grid grid-cols-1 gap-3">
          {jobTypes.map((jobType) => (
            <div key={jobType.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <Checkbox
                id={`${jobType.value}-filter`}
                name="jobTypes"
                onCheckedChange={(checked) => {
                  handleJobTypeChange(jobType.value, checked as boolean);
                }}
                checked={currentJobTypes.includes(jobType.value)}
                className="cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                className="text-sm font-medium cursor-pointer flex-1"
                htmlFor={`${jobType.value}-filter`}
              >
                {jobType.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card className="hidden lg:block col-span-1 border border-border/50 shadow-none h-fit sticky top-8 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight">Filters</CardTitle>
            <Button
              onClick={clearAllFilter}
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <span>Clear</span>
              <XIcon className="size-3.5 ml-1.5" />
            </Button>
          </div>
          <Separator className="bg-border/50" />
        </CardHeader>
        <CardContent className="pt-2">
          <FilterContent />
        </CardContent>
      </Card>

      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-border/50 hover:border-primary/50 hover:bg-accent transition-all shadow-none"
                >
                  <SlidersHorizontalIcon className="size-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[400px] border-l border-border/50">
                <SheetHeader className="pb-6">
                  <SheetTitle className="text-2xl font-bold">Job Filters</SheetTitle>
                  <SheetDescription className="text-base">
                    Filter jobs by type and time posted to find the perfect match.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-2">
                  <FilterContent />
                </div>
                <div className="mt-8 pt-6 border-t border-border/50">
                  <Button
                    onClick={clearAllFilter}
                    variant="outline"
                    className="w-full shadow-none border-border/50 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <span>Clear All Filters</span>
                    <XIcon className="size-4 ml-2" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              onClick={clearAllFilter}
              variant="outline"
              className="shadow-none border-border/50 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <span>Clear All</span>
              <XIcon className="size-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default JobFilterSection;