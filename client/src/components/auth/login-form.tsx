"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Google from "@/assets/svg/Google";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES, getDynamicRoute } from "@/config/routes";
import { Button, Input, Label } from "../ui";
import { useMutation } from "@tanstack/react-query";
import { User } from "@/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const redirectTo = searchParams.get("redirect") || ROUTES.HOME;

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (user: Pick<User, "email" | "password">) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          pass: user.password,
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
      if (data && data.statusCode === 401) {
        setError(data.message);
      }

      if (data && data.statusCode === 404) {
        setError("Notfound");
      }

      if (data && data.message === "Login successful") {
        redirect(`/auth/callback?token=${data.token}`);
      }
    },
    onError(error) {
      console.log(error.message);

      console.error(error);
    },
  });
  const [formData, setFormData] = useState<Pick<User, "email" | "password">>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Pick<User, "email" | "password">>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<Pick<User, "email" | "password">> = {};

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

  const handleInputChange = (field: keyof Pick<User, "email" | "password">, value: string) => {
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

  return (
    <div className="flex flex-col gap-6">
      {error === "Notfound" && (
        <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/50 text-destructive px-5 py-4 rounded-xl backdrop-blur-sm">
          <p className="font-semibold text-base mb-1.5">User not found</p>
          <p className="text-sm opacity-90">There was no user with given email. Please register.</p>
        </div>
      )}

      {error === "Unauthorized" && (
        <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/50 text-destructive px-5 py-4 rounded-xl backdrop-blur-sm">
          <p className="font-semibold text-base mb-1.5">Authentication Failed</p>
          <p className="text-sm opacity-90">Either your email or password is incorrect.</p>
        </div>
      )}

      {error === "AccessDenied" && (
        <div className="bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/50 text-yellow-700 dark:text-yellow-500 px-5 py-4 rounded-xl backdrop-blur-sm">
          <p className="font-semibold text-base mb-1.5">Complete Profile Required</p>
          <p className="text-sm opacity-90 mb-3">
            Please complete your profile setup before accessing the platform.
          </p>
          <Link
            href={getDynamicRoute.registerWithRedirect(
              redirectTo !== ROUTES.HOME ? redirectTo : undefined,
              true
            )}
            className="text-sm font-semibold underline hover:no-underline inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            Complete profile <span>→</span>
          </Link>
        </div>
      )}

      <Card className="text-center shadow-none border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                className={error === "Unauthorized" ? "border-destructive" : ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                type="email"
                required={true}
                disabled={isPending}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                className={error === "Unauthorized" ? "border-destructive" : ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                type="password"
                required={true}
                disabled={isPending}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" disabled={isPending} className="w-full" size="lg">
              {isPending ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="my-4">OR</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`;
              }}
              className="group w-full flex items-center justify-center gap-3 px-5 py-3.5 border-2 border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 font-medium"
            >
              <Google className="size-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Continue with Google</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm pt-2">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link
          href={
            redirectTo !== ROUTES.HOME
              ? getDynamicRoute.registerWithRedirect(redirectTo)
              : ROUTES.REGISTER
          }
          className="text-primary hover:underline font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          Create one here <span>→</span>
        </Link>
      </div>

      <div className="text-xs text-muted-foreground/80 text-balance text-center leading-relaxed pt-2">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  );
};

export default LoginForm;
