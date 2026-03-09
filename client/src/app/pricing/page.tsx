"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Starter",
    description: "Perfect for exploring opportunities and testing the waters",
    price: {
      monthly: 0,
      annual: 0,
    },
    features: [
      "Browse unlimited job listings",
      "Apply to up to 10 jobs per month",
      "Create basic profile",
      "Save favorite job listings",
      "Email notifications for new jobs",
      "Standard support response time",
    ],
    cta: "Get Started",
    popular: false,
    color: "border-border/50",
  },
  {
    name: "Professional",
    description: "Ideal for active job seekers and small hiring teams",
    price: {
      monthly: 29,
      annual: 290,
    },
    features: [
      "Everything in Starter",
      "Unlimited job applications",
      "Featured profile visibility",
      "Advanced search & filters",
      "AI-powered job recommendations",
      "Application tracking dashboard",
      "Resume review tools",
      "Post up to 5 job listings/month",
      "Priority support access",
    ],
    cta: "Subscribe Now",
    popular: true,
    color: "border-primary",
  },
  {
    name: "Enterprise",
    description: "Built for companies scaling their recruitment efforts",
    price: {
      monthly: 99,
      annual: 990,
    },
    features: [
      "Everything in Professional",
      "Unlimited job postings",
      "Advanced AI candidate matching",
      "Branded company profile page",
      "Multi-user team accounts",
      "Applicant tracking system (ATS)",
      "Analytics & hiring insights",
      "API access for integrations",
      "Dedicated account manager",
      "24/7 premium support",
    ],
    cta: "Contact Sales",
    popular: false,
    color: "border-orange-500/50",
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly"
  );

  const handleCheckout = (tierName: string, price: number) => {
    if (price === 0) {
      // Free tier - redirect to sign up
      window.location.href = "/register";
      return;
    }

    if (tierName === "Enterprise") {
      // Contact sales for enterprise
      alert("Please contact sales@talentscope.com for enterprise pricing");
      return;
    }

    const confirmRedirect = window.confirm(
      `You'll be redirected to Stripe to complete your ${tierName} subscription (${billingPeriod} billing).\n\nClick OK to continue to Stripe.`
    );

    if (confirmRedirect) {
      window.location.href = "https://stripe.com";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-between items-center mb-12">
          <Logo size="xl" showText={true} href="/" />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Simple, Transparent{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Upgrade, downgrade, or
            cancel anytime.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <span
              className={`text-sm font-medium transition-colors ${billingPeriod === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
                }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "monthly" ? "annual" : "monthly"
                )
              }
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${billingPeriod === "annual" ? "bg-primary" : "bg-muted"
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${billingPeriod === "annual"
                  ? "translate-x-8"
                  : "translate-x-1"
                  }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${billingPeriod === "annual"
                ? "text-foreground"
                : "text-muted-foreground"
                }`}
            >
              Annual{" "}
              <span className="text-primary font-semibold">(Save 17%)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border-2 ${tier.color} p-8 bg-card/50 backdrop-blur-sm ${tier.popular
                ? "shadow-2xl shadow-primary/10 scale-105 md:scale-110"
                : "hover:shadow-lg"
                } transition-all duration-300`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    {tier.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">
                    ${tier.price[billingPeriod]}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingPeriod === "monthly" ? "mo" : "yr"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleCheckout(tier.name, tier.price[billingPeriod])
                  }
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${tier.popular
                    ? "bg-primary text-primary-foreground hover:shadow-lg hover:scale-105"
                    : "border-2 border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                >
                  {tier.cta}
                </button>

                <div className="border-t border-border/50 pt-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Have questions? We&apos;re here to help.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border border-border/50 rounded-xl p-6 bg-card/30">
            <h3 className="font-semibold text-lg mb-2">
              Can I change my plan later?
            </h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade, downgrade, or cancel your subscription at
              any time. Changes take effect at the start of your next billing
              cycle.
            </p>
          </div>

          <div className="border border-border/50 rounded-xl p-6 bg-card/30">
            <h3 className="font-semibold text-lg mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-muted-foreground">
              We accept all major credit cards (Visa, MasterCard, American
              Express) through our secure payment processor.
            </p>
          </div>

          <div className="border border-border/50 rounded-xl p-6 bg-card/30">
            <h3 className="font-semibold text-lg mb-2">
              Is there a free trial?
            </h3>
            <p className="text-muted-foreground">
              Our Starter plan is completely free forever! You can upgrade to a
              paid plan at any time to unlock additional features.
            </p>
          </div>

          <div className="border border-border/50 rounded-xl p-6 bg-card/30">
            <h3 className="font-semibold text-lg mb-2">
              What happens if I cancel?
            </h3>
            <p className="text-muted-foreground">
              You&apos;ll retain access to your paid features until the end of
              your current billing period. After that, you&apos;ll be moved to
              the free Starter plan.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background p-12 md:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
          <div className="relative text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Still have questions?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our team is here to help. Contact us and we&apos;ll get back to
              you as soon as possible.
            </p>
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <Logo size="lg" showText={true} href="/" className="justify-center" />
            <p className="text-sm text-muted-foreground/80">
              © 2025 TalentScope. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
