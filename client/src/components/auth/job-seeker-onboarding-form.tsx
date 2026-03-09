"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";

interface JobSeekerOnboardingFormProps {
  token: string;
  userId: number;
}

export interface JobSeekerFormData {
  name: string;
  resume: File | null;
}

const JobSeekerOnboardingForm = ({ token, userId }: JobSeekerOnboardingFormProps) => {
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["profile", "onboarding", "user"],
    mutationFn: async (jobseekerData: JobSeekerFormData) => {
      const formData = new FormData();
      formData.append("name", jobseekerData.name);
      formData.append("userId", userId.toString());

      if (jobseekerData.resume) {
        formData.append("resume", jobseekerData.resume);
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resumes`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data;
    },
    onSuccess(data) {
      if (data) {
        redirect("/");
      }
    },
    onError(error) {
      console.error(error);
    },
  });
  const [formData, setFormData] = useState<JobSeekerFormData>({
    name: "",
    resume: null,
  });
  const [errors, setErrors] = useState<Partial<{ name: string; resume: string }>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<{ name: string; resume: string }> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    await mutateAsync(formData);
    // try {
    // } catch (error) {
    //   console.error("Job seeker onboarding error:", error);
    //   toast({
    //     title: "Setup Error",
    //     description: "Failed to set up your profile. Please try again.",
    //     variant: "destructive",
    //   });
    // }
  };

  const handleInputChange = (field: keyof JobSeekerFormData, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    handleInputChange("resume", file);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Set Up Your Profile</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself to find the perfect job opportunities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Name for the resume"
            required={false}
            disabled={isPending}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Upload Resume *</Label>
          <Input
            id="resume"
            onChange={handleFileChange}
            placeholder="Upload your resume"
            type="file"
            accept="application/pdf"
            disabled={isPending}
          />
          {errors.resume && <p className="text-sm text-destructive">{errors.resume}</p>}
        </div>

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? "Setting up your profile..." : "Complete Profile Setup"}
        </Button>
      </form>

      <div className="text-xs text-muted-foreground text-balance text-center">
        You can update your profile information anytime from your dashboard.
      </div>
    </div>
  );
};

export default JobSeekerOnboardingForm;
