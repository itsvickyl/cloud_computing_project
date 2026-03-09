"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isValidUrl, isValidTwitterHandle } from "@/utils/validation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface CompanyFormData {
  name: string;
  desc: string;
  address: string;
  website: string;
  linkedin: string;
  xLink?: string;
  logo: File | null;
}

const CompanyOnboardingForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["profile", "onboarding", "company"],
    mutationFn: (companyData: CompanyFormData) => {
      const formData = new FormData();
      formData.append("name", companyData.name);
      formData.append("address", companyData.address);
      formData.append("desc", companyData.desc);
      formData.append("linkedin", companyData.linkedin);
      formData.append("website", companyData.website);

      if (companyData.xLink) {
        formData.append("xLink", companyData.xLink);
      }
      if (companyData.logo) {
        formData.append("logo", companyData.logo);
      }

      return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/companies`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      router.push("/");
    },
    onError: (err) => {
      console.error(err);
    },
  });
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    address: "",
    desc: "",
    website: "",
    linkedin: "",
    logo: null,
    xLink: "",
  });
  const [errors, setErrors] = useState<
    Partial<Exclude<CompanyFormData, "logo">> & { logo?: string }
  >({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<Exclude<CompanyFormData, "logo"> & { logo?: string }> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.desc.trim()) {
      newErrors.desc = "Company description is required";
    } else if (formData.desc.trim().length < 50) {
      newErrors.desc = "Company description must be at least 50 characters";
    }

    if (!formData.website.trim()) {
      newErrors.website = "Website is required";
    } else if (!isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    if (formData.xLink && !isValidTwitterHandle(formData.xLink)) {
      newErrors.xLink = "Please enter a valid X (Twitter) handle";
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

    try {
      const normalizedWebsite = formData.website.startsWith("http")
        ? formData.website
        : `https://${formData.website}`;

      const normalizedXAccount = formData.xLink
        ? formData.xLink.startsWith("@")
          ? formData.xLink
          : `@${formData.xLink}`
        : undefined;

      const cData = {
        ...formData,
        website: normalizedWebsite,
        xLink: normalizedXAccount,
      };

      await mutateAsync(cData);
    } catch (error) {
      console.error("Company onboarding error:", error);
      toast({
        title: "Setup Error",
        description: "Failed to set up your company profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof CompanyFormData, value: string | File | null) => {
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
    handleInputChange("logo", file);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Set Up Your Company Profile</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your company to start posting jobs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your company name"
            disabled={isPending}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="e.g., San Francisco, CA"
            disabled={isPending}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website *</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="www.yourcompany.com"
            disabled={isPending}
          />
          {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">Linkedin Profile (Optional)</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => handleInputChange("linkedin", e.target.value)}
            placeholder="https://www.linkedin.com/company/yourcompany"
            disabled={isPending}
          />
          {errors.linkedin && <p className="text-sm text-destructive">{errors.linkedin}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="xAccount">X (Twitter) Handle (Optional)</Label>
          <Input
            id="xAccount"
            value={formData.xLink}
            onChange={(e) => handleInputChange("xLink", e.target.value)}
            placeholder="@yourcompany"
            disabled={isPending}
          />
          {errors.xLink && <p className="text-sm text-destructive">{errors.xLink}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Upload Logo</Label>
          <Input
            id="logo"
            onChange={handleFileChange}
            placeholder="Upload your logo"
            type="file"
            accept="images/*"
            disabled={isPending}
          />
          {errors.logo && <p className="text-sm text-destructive">{errors.logo}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="about">Company Description *</Label>
          <textarea
            id="about"
            value={formData.desc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange("desc", e.target.value)
            }
            placeholder="Tell us about your company, what you do, your mission, culture, etc."
            rows={4}
            disabled={isPending}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            {formData.desc.length}/50 characters minimum
          </p>
          {errors.desc && <p className="text-sm text-destructive">{errors.desc}</p>}
        </div>

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? "Setting up your company..." : "Complete Company Setup"}
        </Button>
      </form>
    </div>
  );
};

export default CompanyOnboardingForm;
