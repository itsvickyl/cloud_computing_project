"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Chrome } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { ROUTES, getDynamicRoute } from "@/config/routes";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Input } from "../ui";

interface RegisterFormProps {
  searchParams?: {
    redirect?: string;
    new?: string;
    error?: string;
    email?: string;
  };
}

type RegisterUser = Pick<User, "email" | "password" | "username">;

const RegisterForm = ({ searchParams }: RegisterFormProps) => {
  const [userType, setUserType] = useState<"user" | "org" | null>(null);
  const [formData, setFormData] = useState<RegisterUser>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterUser>>({});
  const { toast } = useToast();
  const router = useRouter();

  const redirectTo = searchParams?.redirect || ROUTES.HOME;
  const isNewUser = searchParams?.new === "true";

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: async (user: RegisterUser) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          ...user,
          type: userType,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      return data;
    },
    onSuccess(data) {
      if (data && data.statusCode === 409) {
        setErrors({
          email: "Email already registered",
        });
      }

      if (data && data.message === "Password weak") {
        setErrors({
          password:
            "Password must be atleast 8 characters, have atleast one number, one special character and one capital letter",
        });
      }

      if (data && data.message === "Registered successfully") {
        redirect(`/auth/callback?token=${data.token}&redirectTo=/onboarding`);
      }
    },
    onError(error) {
      console.error(error);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterUser> = {};

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
  };

  const handleInputChange = (field: keyof RegisterUser, value: string) => {
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

  useEffect(() => {}, [redirectTo, router, isNewUser]);

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google?userType=${userType}&redirectTo=/onboarding`;
  };

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">
          {isNewUser ? "Complete Your Profile" : "Create Your Account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isNewUser
            ? "Choose your account type to get started"
            : "Join our platform and start your journey"}
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-semibold">I am a:</Label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setUserType("user")}
            className={`group flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 transition-all duration-200 ${
              userType === "user"
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/5 scale-[1.02]"
                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
              👤
            </span>
            <span className={`font-semibold text-sm ${userType === "user" ? "text-primary" : ""}`}>
              Job Seeker
            </span>
            <span className="text-xs text-muted-foreground">Find opportunities</span>
          </button>
          <button
            onClick={() => setUserType("org")}
            className={`group flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 transition-all duration-200 ${
              userType === "org"
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/5 scale-[1.02]"
                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
              🏢
            </span>
            <span className={`font-semibold text-sm ${userType === "org" ? "text-primary" : ""}`}>
              Recruiter
            </span>
            <span className="text-xs text-muted-foreground">Find talent</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email"
            className={errors.email ? "border-destructive" : ""}
            type="email"
            required={true}
            disabled={isPending}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder="Enter your username"
            required={true}
            disabled={isPending}
          />
          {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Enter your password"
            type="password"
            required={true}
            disabled={isPending}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <Button type="submit" disabled={isPending || !userType} className="w-full" size="lg">
          {isPending ? "Registering..." : "Register"}
        </Button>
      </form>

      <p className="my-4">OR</p>

      <div className="space-y-3 pt-2">
        <Button
          onClick={handleGoogleSignIn}
          disabled={!userType}
          variant="outline"
          className="w-full border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 py-6 rounded-xl font-medium transition-all duration-200"
          size="lg"
        >
          <Chrome className="w-5 h-5 mr-2.5" />
          Continue with Google
        </Button>
      </div>

      <div className="text-center text-sm pt-2">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          href={
            redirectTo !== ROUTES.HOME
              ? getDynamicRoute.loginWithRedirect(redirectTo)
              : ROUTES.LOGIN
          }
          className="text-primary hover:underline font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          Sign in here <span>→</span>
        </Link>
      </div>

      <div className="text-xs text-muted-foreground/80 text-balance text-center leading-relaxed pt-2">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  );
};

export default RegisterForm;
