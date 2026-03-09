"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen flex items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <h1 className="text-2xl font-bold">
            Talent<span className="text-primary">Scope</span>
          </h1>
        </Link>

        <Card>
          <CardHeader className="space-y-3">
            <div className="mx-auto">
              <h2 className="text-7xl font-bold text-primary text-center">404</h2>
            </div>
            <CardTitle className="text-center text-2xl">Page Not Found</CardTitle>
            <CardDescription className="text-center">
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <Link href="/" className="w-full">
                <Button variant="default" className="w-full">
                  <Home className="size-4 mr-2" />
                  Go to Home
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  <Search className="size-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          Need help? Contact{" "}
          <Link href="mailto:support@talentscope.com" className="text-primary hover:underline">
            support
          </Link>
        </p>
      </div>
    </div>
  );
}
