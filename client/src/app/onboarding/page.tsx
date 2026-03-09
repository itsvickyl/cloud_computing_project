import { User } from "@/types";
import CompanyOnboardingForm from "@/components/auth/company-onboarding-form";
import JobSeekerOnboardingForm from "@/components/auth/job-seeker-onboarding-form";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getAuthToken } from "@/lib/server-only";
import { redirect } from "next/navigation";

const page = async () => {
  const authToken = await getAuthToken();
  let userData: User | null = null;

  if (authToken) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
        headers: {
          Cookie: `${process.env.AUTH_COOKIE_TOKEN_NAME || "talentscope-auth-token"}=${authToken}`,
        },
      });
      const data = await res.json();
      userData = data;
    } catch (error) {
      console.error(error);
    }

    if (!userData) {
      redirect("/");
    }

    if (userData.type === "org") {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>
          <div className="flex w-full max-w-md flex-col gap-8">
            <CompanyOnboardingForm token={authToken} />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="flex w-full max-w-md flex-col gap-8">
          <JobSeekerOnboardingForm token={authToken} userId={userData.id} />
        </div>
      </div>
    );
  }

  redirect("/");
};

export default page;
