import React from "react";
import RegisterForm from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/config/routes";

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

const page = async ({ searchParams }: RegisterPageProps) => {
  const params = await searchParams;

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <Logo size="lg" showText={true} href={ROUTES.HOME} className="self-center justify-center" />
        </div>

        <RegisterForm searchParams={params} />
      </div>
    </div>
  );
};

export default page;
