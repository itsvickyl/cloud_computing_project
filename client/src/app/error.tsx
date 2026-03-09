"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Oops! Something went wrong</h1>
          <p className="text-muted-foreground text-lg">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-2">
          <Button onClick={() => reset()}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left max-w-2xl mx-auto">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error details (dev only)
            </summary>
            <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
