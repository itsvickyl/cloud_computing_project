import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/ui/logo";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in. Please contact support if you believe this is an error.",
  },
  Verification: {
    title: "Verification Error",
    description: "The verification link is invalid or has expired. Please try signing in again.",
  },
  OAuthSignin: {
    title: "Sign In Error",
    description: "There was an error starting the OAuth sign-in process. Please try again.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "There was an error during the OAuth callback. Please try signing in again.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create an account with this OAuth provider. Please try a different method.",
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    description: "Could not create an account with this email. Please try again.",
  },
  Callback: {
    title: "Callback Error",
    description: "There was an error during the sign-in callback. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This account is already associated with another sign-in method. Please use your original sign-in method.",
  },
  EmailSignin: {
    title: "Email Sign In Error",
    description: "There was an error sending the verification email. Please try again.",
  },
  CredentialsSignin: {
    title: "Sign In Failed",
    description: "Invalid credentials. Please check your email and password and try again.",
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page.",
  },
  Default: {
    title: "Authentication Error",
    description: "An unexpected error occurred during authentication. Please try again.",
  },
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const errorType = params.error || "Default";
  const redirectTo = params.redirect || "/";
  const error = errorMessages[errorType] || errorMessages.Default;

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-md flex-col gap-6 px-4">
        <Logo size="lg" showText={true} href="/" className="self-center" />

        <Card className="border-destructive/50">
          <CardHeader className="space-y-3">
            <div className="mx-auto size-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-center text-2xl">{error.title}</CardTitle>
            <CardDescription className="text-center">
              {error.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <Link href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="w-full">
                <Button variant="default" className="w-full">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  <Home className="size-4 mr-2" />
                  Go to Home
                </Button>
              </Link>
            </div>

            {errorType !== "Default" && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Error code: {errorType}
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          If this problem persists, please contact{" "}
          <Link href="mailto:support@talentscope.com" className="text-primary hover:underline">
            support
          </Link>
        </p>
      </div>
    </div>
  );
}
