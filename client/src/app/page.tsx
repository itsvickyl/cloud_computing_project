import { JobFilterSection } from "@/components/jobs";
import JobListingServer, { JobListingLoading } from "@/components/jobs/job-listing-server";
import { PublicNavbar } from "@/components/layouts";
import { Logo, FeatureCard, PricingCard } from "@/components/ui";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Suspense } from "react";
import { Briefcase, Users, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { User } from "@/types";
import { getAuthToken } from "@/lib/server-only";

type SearchParams = {
  searchParams: Promise<{
    page?: string;
    jobTypes?: string;
    timePosted?: string;
  }>;
};

export default async function PublicJobListings({ searchParams }: SearchParams) {
  const authToken = await getAuthToken();

  const isUserLoggedIn = !!authToken;
  let userData: User | null = null;

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const jobTypes = params.jobTypes?.split(",") || [];
  const timePosted = params.timePosted || "all";

  if (isUserLoggedIn) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
        headers: {
          Cookie: `${process.env.NEXT_PUBLIC_AUTH_COOKIE_TOKEN_NAME || "talentscope_token"}=${authToken}`,
        },
      });
      const data = await res.json();

      if (data.statusCode && data.statusCode === 401) {
        userData = null;
      } else {
        userData = data;
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="text-center space-y-12">
            <div className="flex justify-between items-center">
              <Logo size="xl" showText={true} href={ROUTES.HOME} />
              <ThemeToggle />
            </div>

            <div className="space-y-6 pt-12 md:pt-20">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                Find Your Dream Job or{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Perfect Candidate
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect talented professionals with amazing opportunities. Whether you&apos;re
                looking for your next career move or seeking top talent, we&apos;ve got you covered.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href={ROUTES.REGISTER}
                className="min-w-[200px] px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-center"
              >
                Get Started
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className="min-w-[200px] px-8 py-4 border-2 border-border hover:border-primary/50 rounded-xl font-semibold hover:bg-accent transition-all duration-200 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Why Choose TalentScope?</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Everything you need to succeed in your career journey
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <FeatureCard
              icon={Briefcase}
              title="Quality Jobs"
              description="Access thousands of verified job opportunities from top companies across various industries."
            />
            <FeatureCard
              icon={Users}
              title="Top Talent"
              description="Connect with skilled professionals and find the perfect match for your team and company culture."
              iconColor="text-orange-500"
              borderColor="border-orange-500/50"
              shadowColor="shadow-orange-500/5"
              iconBgColor="bg-orange-500/10"
              iconBgHoverColor="group-hover:bg-orange-500/20"
            />
            <FeatureCard
              icon={Search}
              title="Smart Matching"
              description="Our advanced algorithms help match the right candidates with the right opportunities efficiently."
              iconColor="text-pink-500"
              borderColor="border-pink-500/50"
              shadowColor="shadow-pink-500/5"
              iconBgColor="bg-pink-500/10"
              iconBgHoverColor="group-hover:bg-pink-500/20"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Career Growth"
              description="Access resources and opportunities that help accelerate your career growth and professional development."
              iconColor="text-yellow-500"
              borderColor="border-yellow-500/50"
              shadowColor="shadow-yellow-500/5"
              iconBgColor="bg-yellow-500/10"
              iconBgHoverColor="group-hover:bg-yellow-500/20"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Choose the perfect plan to accelerate your career or grow your team
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <PricingCard
              title="Starter"
              description="Perfect for exploring opportunities and testing the waters"
              price={0}
              features={[
                "Browse unlimited job listings",
                "Apply to up to 10 jobs/month",
                "Save favorite job listings",
              ]}
              ctaText="Get Started"
              ctaHref={ROUTES.REGISTER}
            />
            <PricingCard
              title="Professional"
              description="Ideal for active job seekers and small hiring teams"
              price={29}
              features={[
                "Everything in Starter",
                "Unlimited job applications",
                "Featured profile visibility",
                "AI-powered job recommendations",
                "Post up to 5 job listings/month",
              ]}
              ctaText="Subscribe Now"
              ctaHref={ROUTES.PRICING}
              isPrimary
              highlightLabel="Most Popular"
            />
            <PricingCard
              title="Enterprise"
              description="Built for companies scaling their recruitment efforts"
              price={99}
              features={[
                "Everything in Professional",
                "Unlimited job postings",
                "Advanced AI candidate matching",
                "Multi-user team accounts",
                "Dedicated account manager",
              ]}
              ctaText="Contact Sales"
              ctaHref={ROUTES.PRICING}
              variant="secondary"
            />
          </div>

          <div className="text-center mt-12">
            <Link
              href={ROUTES.PRICING}
              className="text-primary hover:text-primary/80 font-semibold text-lg hover:underline transition-all"
            >
              View detailed pricing and features →
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-6">
              <Logo size="lg" showText={true} href={ROUTES.HOME} className="justify-center" />
              <p className="text-muted-foreground text-lg">
                Connecting talent with opportunities worldwide
              </p>
              <p className="text-sm text-muted-foreground/80 pt-4">
                © 2025 TalentScope. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filterKey = `page=${currentPage};types=${jobTypes.join(",")};timePosted=${timePosted}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PublicNavbar user={userData} />
      <div className="pt-8 pb-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <JobFilterSection />

          <div className="lg:col-span-2 flex flex-col gap-6">
            <Suspense fallback={<JobListingLoading />} key={filterKey}>
              <JobListingServer
                currentPage={currentPage}
                jobTypes={jobTypes}
                timePosted={timePosted}
                isPublic={true}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
